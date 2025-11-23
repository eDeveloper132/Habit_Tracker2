import express from 'express';
import chalk from 'chalk';
import cors from 'cors';
import 'dotenv/config';
import connectDB from './db/connection/db.js';
const app = express();
app.use(cors());
app.use(express.json());
const port = process.env.PORT || 2500;
await connectDB();
app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(port, () => {
    console.log(chalk.green(`Server is running at http://localhost:${port}`));
});
//# sourceMappingURL=index.mjs.map