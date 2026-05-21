/**
 * MongoDB-backed auth state for Baileys
 * Replaces useMultiFileAuthState so sessions persist on Railway/Heroku/etc.
 * Baileys is dynamically imported so this module is safe to load on startup.
 */
import WaSession from "../models/waSession.model.js";

export async function useMongoAuthState() {
  // Lazy-load Baileys only when this function is actually called
  const { initAuthCreds, BufferJSON, proto } = await import("@whiskeysockets/baileys");

  const writeData = async (key, data) => {
    await WaSession.findByIdAndUpdate(
      key,
      { data: JSON.parse(JSON.stringify(data, BufferJSON.replacer)) },
      { upsert: true, new: true }
    );
  };

  const readData = async (key) => {
    const doc = await WaSession.findById(key).lean();
    if (!doc) return null;
    try {
      return JSON.parse(JSON.stringify(doc.data), BufferJSON.reviver);
    } catch {
      return null;
    }
  };

  const removeData = async (key) => {
    await WaSession.findByIdAndDelete(key);
  };

  // Load or create credentials
  const creds = (await readData("creds")) || initAuthCreds();

  return {
    state: {
      creds,
      keys: {
        get: async (type, ids) => {
          const data = {};
          await Promise.all(
            ids.map(async (id) => {
              const key = `${type}-${id}`;
              let val = await readData(key);
              if (type === "app-state-sync-key" && val) {
                val = proto.Message.AppStateSyncKeyData.fromObject(val);
              }
              data[id] = val;
            })
          );
          return data;
        },
        set: async (data) => {
          const tasks = [];
          for (const category of Object.keys(data)) {
            for (const id of Object.keys(data[category])) {
              const val = data[category][id];
              const key = `${category}-${id}`;
              tasks.push(val ? writeData(key, val) : removeData(key));
            }
          }
          await Promise.all(tasks);
        },
      },
    },
    saveCreds: async () => {
      await writeData("creds", creds);
    },
    clearSession: async () => {
      await WaSession.deleteMany({});
    },
  };
}
