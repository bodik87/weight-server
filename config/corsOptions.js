const allowedOrigins = [
  "https://weight-client.vercel.app",
  "http://localhost:5173",
  "https://bodik87.github.io/vite-weight",
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};
