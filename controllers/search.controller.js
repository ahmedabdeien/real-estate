import Project from "../models/project.model.js";
import Unit from "../models/unit.model.js";
import Blog from "../models/blog.model.js";
import Career from "../models/career.model.js";

export const globalSearch = async (req, res) => {
  try {
    const q = (req.query.q || "").trim();
    if (!q || q.length < 2) {
      return res.json({ success: true, results: [] });
    }

    const regex = new RegExp(q, "i");

    const [projects, units, blogs, careers] = await Promise.all([
      Project.find({
        published: true,
        $or: [
          { "name.ar": regex },
          { "name.en": regex },
          { "location.city.ar": regex },
          { "description.ar": regex },
        ],
      }).select("name slug coverImage location status").limit(5),

      Unit.find({
        published: true,
        $or: [
          { unitNumber: regex },
          { "description.ar": regex },
        ],
      }).populate("project", "name slug").select("unitNumber type area price status project").limit(5),

      Blog.find({
        status: "published",
        $or: [
          { "title.ar": regex },
          { "title.en": regex },
          { "excerpt.ar": regex },
        ],
      }).select("title slug coverImage publishedAt").limit(5),

      Career.find({
        published: true,
        $or: [
          { "title.ar": regex },
          { "department.ar": regex },
          { "location.ar": regex },
        ],
      }).select("title department location type").limit(5),
    ]);

    const results = [
      ...projects.map((p) => ({ type: "project", label: p.name?.ar, sub: p.location?.city?.ar, img: p.coverImage, href: `/projects/${p.slug}`, badge: "مشروع" })),
      ...units.map((u) => ({ type: "unit", label: `وحدة ${u.unitNumber}`, sub: u.project?.name?.ar, href: `/units`, badge: "وحدة" })),
      ...blogs.map((b) => ({ type: "blog", label: b.title?.ar, img: b.coverImage, href: `/blog/${b.slug}`, badge: "مقال" })),
      ...careers.map((c) => ({ type: "career", label: c.title?.ar, sub: c.department?.ar, href: `/careers`, badge: "وظيفة" })),
    ];

    res.json({ success: true, results, query: q });
  } catch (err) {
    res.status(500).json({ success: false, message: "فشل البحث" });
  }
};
