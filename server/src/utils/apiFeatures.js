class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    const queryObj = { ...this.queryString };
    const excluded = ['page', 'sort', 'limit', 'fields', 'search'];
    excluded.forEach(el => delete queryObj[el]);
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);
    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  search(fields) {
    if (this.queryString.search) {
      const regex = new RegExp(this.queryString.search, 'i');
      this.query = this.query.find({ $or: fields.map(f => ({ [f]: regex })) });
    }
    return this;
  }

  sort() {
    if (this.queryString.sort) {
      this.query = this.query.sort(this.queryString.sort.split(',').join(' '));
    } else {
      this.query = this.query.sort('-createdAt');
    }
    return this;
  }

  paginate() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10) || 20;
    this.query = this.query.skip((page - 1) * limit).limit(limit);
    this.page = page;
    this.limit = limit;
    return this;
  }
}

module.exports = APIFeatures;
