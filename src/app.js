const path = require("path");
const dotenv = require("dotenv");
const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");

const authRouter = require("./routes/auth.routes");
const userRouter = require("./routes/user.routes");
const postRoutes = require("./routes/post.routes");
const commentRoutes = require("./routes/comment.routes");
const viewRoutes = require("./routes/view.routes");
const sequelize = require("./config/database.config");

dotenv.config({ path: "../.env" });

sequelize
  .authenticate()
  .then(() => {
    console.log("Connected to the database");
  })
  .catch((err) => {
    console.error("Could not connect to the database", err);
  });

// this function is used to check if the database is connected properly
// (async () => {
//   try {
//     const [results, metadata] = await sequelize.query(
//       "SELECT id, email FROM users"
//     );
//     console.log(results);
//   } catch (error) {
//     console.error(error);
//   }
// })();

const User = require("./models/User");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const LikeComment = require("./models/LikeComment");
const LikePost = require("./models/LikePost");

// LikeComment.findAll({ raw: true })
//   .then((users) => {
//     console.log(users);
//   })
//   .catch((error) => {
//     console.log("err");
//   });
// LikePost.findAll({
//   raw: true,
//   attributes: [
//     'post_id',
//     [sequelize.fn("COUNT", sequelize.col('post_id')), "like_post_count"],
//   ],
//   group: [
//     'post_id'
//   ]
// }).then((post) => {
//   console.log(post);
// });

// Comment.findAll({
//   raw: true,
//   attributes: ['user.name', 'post.content'],
//   include: [
//     {
//       model: User,
//       as: "user",
//       // Optional: Specify the desired attributes from the joined table
//       attributes: ["id", "name", "email", "password"],
//     },
//     {
//       model: Post,
//       as: "post",
//       // Optional: Specify the desired attributes from the joined table
//       attributes: ["id", "title", "content"],
//     },
//   ],
// })
//   .then((users) => {
//     console.log("Users:", users);
//   })
//   .catch((error) => {
//     console.error("Unable to fetch users:", error);
//   });

// (async () => {
//   try {
//     const results = await User.findAll({
//       // raw: true,
//       attributes: [
//         //   'name',
//         //   'email',
//         //   'profilePicture',
//         // [sequelize.fn("COUNT", sequelize.col("posts.id")), "totalPosts"],
//       ],
//       include: [
//         {
//           model: Post,
//           as: "posts",
//           attributes: ["id", "title", "content"],
//           // attributes: ['id']
//         },
//       ],
//       // group: ['User.id', 'User.name', 'User.email', 'User.profilePicture'],
//       // order: [[sequelize.literal('totalPosts'), 'DESC']],
//       limit: 10,
//     });

//     console.log("Users fetched successfully");
//     // console.log(results);
//     const plainUsers = await results.map((user) => user.get({ plain: true }));
//     console.log(plainUsers);
//     // for (const user of plainUsers) {
//     //   console.log(user);
//     // }
//     return results;
//   } catch (error) {
//     console.error("Failed to fetch users:", error);
//     // throw error;
//   }
// })();

const port = process.env.PORT || 3000;

let app = express();

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set("view engine", "ejs");
app.set("views", "src/views");

app.use(express.static(path.join(__dirname, "public")));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/img");
  },
  filename: (req, file, cb) => {
    cb(null, req.body.name);
  },
});

var upload = multer({ storage: storage });

app.use("/view", viewRoutes);

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);

app.post("/api/upload", upload.single("file"), (req, res) => {
  console.log(req.body);
  res.status(200).json("File uploaded successfully");
});

app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ message: `Cannot find ${req.originalUrl} on this server` });
});

app.listen(port, () => {
  console.log(`App running on port: ${port}`);
});
