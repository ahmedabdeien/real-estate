require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const connectDB = require('./config/db');
const { setupSockets } = require('./sockets');

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

connectDB();

app.use(helmet());
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.set('io', io);

app.use('/api/auth', require('./routes/auth'));
app.use('/api/companies', require('./routes/companies'));
app.use('/api/users', require('./routes/users'));
app.use('/api/roles', require('./routes/roles'));
app.use('/api/properties', require('./routes/properties'));
app.use('/api/units', require('./routes/units'));
app.use('/api/customers', require('./routes/customers'));
app.use('/api/contracts', require('./routes/contracts'));
app.use('/api/invoices', require('./routes/invoices'));
app.use('/api/payments', require('./routes/payments'));
app.use('/api/expenses', require('./routes/expenses'));
app.use('/api/reports', require('./routes/reports'));
app.use('/api/theme', require('./routes/theme'));
app.use('/api/notifications', require('./routes/notifications'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api/chat', require('./routes/chat'));
app.use('/api/plans', require('./routes/plans'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/cms',   require('./routes/cms'));
app.use('/api/media',     require('./routes/media'));
app.use('/api/documents', require('./routes/documents'));
app.use('/api/pages',     require('./routes/pages'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
});

setupSockets(io);

const { startJobs } = require('./jobs/overdueJob');
startJobs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
