const sequelize = require("../config/database.config");
const User = require("../models/User");
const Post = require("../models/Post");

// update user function is not worked

// exports.addNewUser = (data) => {
//   return new Promise((resolve, reject) => {
//     sequelize.query("INSERT INTO users SET ?", data, (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         console.log("New user inserted successfully");
//         resolve(results);
//       }
//     });
//   });
// };

exports.addNewUser = (data) => {
  return User.create(data)
    .then(user => {
      console.log("New user inserted successfully");
      return user;
    })
    .catch(error => {
      throw error;
    });
};

// exports.findAllUsers = () => {
//   return new Promise((resolve, reject) => {
//     sequelize.query("SELECT * FROM users", (err, results) => {
//       if (err) {
//         reject(err);
//       } else {
//         if (results.length > 0) {
//           console.log("Users found successfully");
//           resolve(results);
//         } else {
//           reject(new Error("User not found"));
//         }
//       }
//     });
//   });
// };

exports.findAllUsers = async () => {
  return await User.findAll()
    .then(users => {
      if (users.length > 0) {
        console.log("Users found successfully");
        return users;
      } else {
        throw new Error("User not found");
      }
    })
    .catch(error => {
      throw error;
    });
};

// exports.findUserById = (id) => {
//   return new Promise((resolve, reject) => {
//     const query = "SELECT * FROM users WHERE id = :id";
//     const replacements = {
//       id: id,
//     };
//     sequelize
//       .query(query, {
//         replacements: replacements,
//         type: sequelize.QueryTypes.SELECT,
//       })
//       .then((result) => {
//         if (result.length > 0) {
//           console.log("User found successfully");
//           resolve(result);
//         } else {
//           reject(new Error("User not found"));
//         }
//       })
//       .catch((err) => {
//         reject(err);
//       });
//   });
// };

exports.findUserById = async (id) => {
  return await User.findOne({
    raw: true,
    where: {
      id: id,
    },
  })
    .then((user) => {
      if (user) {
        console.log("User found successfully");
        return user;
      } else {
        throw new Error("User not found");
      }
    })
    .catch((error) => {
      // throw error;
      console.error("Failed to find user:", error);
    });
};

// exports.findUserByEmail = (email) => {
//   return new Promise((resolve, reject) => {
//     const query = "SELECT * FROM users WHERE email = :email";
//     const replacements = {
//       email: email,
//     };
//     sequelize
//       .query(query, {
//         replacements: replacements,
//         type: sequelize.QueryTypes.SELECT,
//       })
//       .then((results) => {
//         if (results.length > 0) {
//           console.log("User found successfully");
//           resolve(results);
//         } else {
//           reject(new Error("User not found"));
//         }
//       })
//       .catch((error) => {
//         reject(error);
//       });
//   });
// };

exports.findUserByEmail = async (email) => {
  return await User.findOne({
    raw: true,
    where: { email: email },
  })
    .then((user) => {
      if (user) {
        console.log("User found successfully");
        return user;
      } else {
        throw new Error("User not found");
      }
    })
    .catch((error) => {
      throw error;
    });
};

exports.updateUser = (id, user) => {
  return User.update(user, {
    where: { id: parseInt(id, 10) },
  })
    .then((results) => {
      if (results > 0) {
        console.log("User updated successfully");
        return results;
      } else {
        throw new Error("User not found");
      }
    })
    .catch((error) => {
      throw error;
    });
};

// exports.updateUser = (id, user) => {
//   return new Promise((resolve, reject) => {
//     sequelize.query(
//       "UPDATE users SET ? WHERE id = ?",
//       [user, parseInt(id, 10)],
//       (err, results) => {
//         if (err) {
//           reject(err);
//         } else {
//           console.log("User updated successfully");
//           resolve(results);
//         }
//       }
//     );
//   });
// };

exports.getUsersWithMostPosts = () => {
  const query = `SELECT u.name AS name, u.email AS email, u.profilePicture AS profilePicture, COUNT(p.author) AS totalPosts
    FROM posts p
    JOIN users u ON p.author = u.id
    GROUP BY p.author, u.name, u.email, u.profilePicture
    ORDER BY totalPosts DESC
    LIMIT 5;`;

  return sequelize
    .query(query, { type: sequelize.QueryTypes.SELECT })
    .then((results) => {
      console.log("Users retrieved successfully");
      return results;
    })
    .catch((error) => {
      throw error;
    });
};
