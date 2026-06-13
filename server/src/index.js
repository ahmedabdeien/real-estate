require('dotenv').config();
const express    = require('express');
const http       = require('http');
const { Server } = require('socket.io');
const cors       = require('cors');
const helmet     = require('helmet');
const morgan     = require('morgan');
const rateLimit  = require('express-rate-limit');
const connectDB  = require('./config/db');
const { getRedis }          = require('./config/redis');
const { setupSockets }      = require('./sockets');
const { startEmailWorker }  = require('./workers/emailWorker');
const { startPdfWorker }    = require('./workers/pdfWorker');
const { startWhatsAppWorker } = require('./workers/whatsappWorker');

const allowedOrigins = (process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map(o => o.trim());

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: allowedOrigins, credentials: true },
});

connectDB();
getRedis(); // init Redis connection (gracefully skipped if REDIS_URL missing)

/* ─── Rate limiting ─── */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 500,
  standardHeaders: true,
  legacyHeaders:   false,
  message: { success: false, message: 'طلبات كثيرة جداً، يرجى الانتظار قليلاً' },
});
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'محاولات دخول كثيرة، يرجى الانتظار 15 دقيقة' },
});

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
app.use('/api/', limiter);

app.set('io', io);

app.use('/api/auth', authLimiter, require('./routes/auth'));
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
app.use('/api/ai',        require('./routes/ai'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, message: 'حدث خطأ في الخادم' });
});

setupSockets(io);

/* ─── Background workers ─── */
startEmailWorker();
startPdfWorker();
startWhatsAppWorker();

const { startJobs } = require('./jobs/overdueJob');
startJobs();

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
