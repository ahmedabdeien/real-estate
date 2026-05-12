import Content from "../models/content.model.js";

export const getContent = async (req, res) => {
  try {
    const content = await Content.findOne({ section: req.params.section });
    res.json({ success: true, data: content?.data || {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getAllContent = async (req, res) => {
  try {
    const contents = await Content.find();
    const map = {};
    contents.forEach((c) => (map[c.section] = c.data));
    res.json({ success: true, content: map });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const upsertContent = async (req, res) => {
  try {
    const content = await Content.findOneAndUpdate(
      { section: req.params.section },
      { data: req.body },
      { upsert: true, new: true }
    );
    res.json({ success: true, data: content.data });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};
