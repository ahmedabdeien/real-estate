import Settings from "../models/settings.model.js";

export const getSettings = async (req, res) => {
  try {
    const { group } = req.query;
    const query = group ? { group } : {};
    const settings = await Settings.find(query);
    const map = {};
    settings.forEach((s) => (map[s.key] = s.value));
    res.json({ success: true, settings: map });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upsertSetting = async (req, res) => {
  try {
    const { key, value, group, label } = req.body;
    const setting = await Settings.findOneAndUpdate(
      { key },
      { value, group, label },
      { upsert: true, new: true }
    );
    res.json({ success: true, setting });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const bulkUpsertSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    const ops = settings.map(({ key, value, group, label }) => ({
      updateOne: {
        filter: { key },
        update: { value, group, label },
        upsert: true,
      },
    }));
    await Settings.bulkWrite(ops);
    res.json({ success: true, message: "تم حفظ الإعدادات" });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
