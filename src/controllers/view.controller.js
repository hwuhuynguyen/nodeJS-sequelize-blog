const userService = require("../service/user.service");
const postService = require("../service/post.service");
const commentService = require("../service/comment.service");
const likeService = require("../service/like.service");

exports.displayHomePage = async function (req, res, next) {
  // const activeUsers = await Post.aggregate([
  //   {
  //     $lookup: {
  //       from: "users",
  //       localField: "author",
  //       foreignField: "_id",
  //       as: "user",
  //     },
  //   },
  //   {
  //     $group: {
  //       _id: "$author",
  //       user: { $first: "$user" },
  //       totalPosts: { $sum: 1 },
  //     },
  //   },
  //   {
  //     $project: {
  //       _id: 0,
  //       name: "$user.name",
  //       email: "$user.email",
  //       profilePicture: "$user.profilePicture",
  //       totalPosts: 1,
  //     },
  //   },
  //   {
  //     $sort: {
  //       totalPosts: -1,
  //     },
  //   },
  //   {
  //     $limit: 5,
  //   },
  // ]);

  const activeUsers = await userService.getUsersWithMostPosts();
  console.log("Active users: ", activeUsers);
  const date = Date.now();
  const posts = await postService.findAllPostsAndItsAuthorAndStats();
  console.log(posts);
  console.log("Find all: ", Date.now() - date);
  const recentPosts = await postService.findRecentPosts();

  res.render("home-page", {
    posts,
    recentPosts,
    activeUsers,
  });
};
exports.displayPosts = async function (req, res, next) {
  const posts = await postService.findAllPostsAndItsAuthorAndStats();
  res.render("post-list", {
    posts,
  });
};

exports.displayPostDetailById = async function (req, res, next) {
  const row = await postService.findPostByIdAndItsAuthorAndLikeCount(
    req.params.postId
  );
  console.log("1================================================");
  // console.log(row);
  // console.log(row[0].createdAt);
  // console.log(typeof row[0].createdAt);
  // // Convert the RowDataPacket object to JSON string and then parse it
  // const rowJson = JSON.stringify(row);
  const post = row[0];
  // post.createdAt = new Date(post.createdAt);
  const comments = await commentService.getCommentSortedOfAPost(
    parseInt(req.params.postId, 10)
  );
  console.log(comments);
  console.log("2================================================");
  await comments.map((comment) => {
    comment.level = comment.path.split(".").length;
  });

  const usersLikedPostRow = await likeService
    .getUsersLikedPost(req.params.postId)
    .catch((error) => { console.log(error);});

    console.log(usersLikedPostRow);
  let usersLikedPost = [];
  if (usersLikedPostRow?.length > 0) {
    usersLikedPost = usersLikedPostRow.map((user) => user.user_id);
    console.log(usersLikedPost);
  }

  if (typeof req.user !== "undefined") {
    console.log("check post and comment like or not");
    if (usersLikedPost.includes(req.user.id)) {
      post.isLiked = true;
    } else {
      post.isLiked = false;
    }
    console.log("3================================================");
    for (let comment of comments) {
      try {
        const likeCount = await likeService.getLikesOfAComment(comment.id);
        await likeCount.map((element) => (comment.like = element.like_count));
        const usersLikedCommentRow = await likeService.getUsersLikedComment(
          comment.id
        );
        if (usersLikedCommentRow.length > 0) {
          const usersLikedComment = usersLikedCommentRow.map(
            (user) => user.user_id
          );
          if (await usersLikedComment.includes(req.user.id)) {
            console.log("true");
            comment.isLiked = true;
          } else {
            console.log("false");
            comment.isLiked = false;
          }
          console.log("comment after save: " + comment.isLiked);
        }
      } catch (err) {}
    }
  }
  console.log(comments);
  res.render("post-detail", { post, comments });
};

exports.displayLoginPage = async function (req, res, next) {
  res.render("auth/login");
};

exports.displayRegisterPage = async function (req, res, next) {
  res.render("auth/register");
};

exports.displayDashboard = async function (req, res, next) {
  const myPosts =
    (await postService.getPostsByUser(req.user.id).catch((err) => {})) || [];
  req.user.dateOfBirth = new Date(req.user.dateOfBirth);
  res.render("dashboard", {
    myPosts,
  });
};
