const multer = require("multer");
const path = require("path");

const userRepository = require("../repositories/user.repository");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/public/img");
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const fileExtension = file.originalname.split(".").pop();
    cb(null, uniqueSuffix + "." + fileExtension);
  },
});

var upload = multer({ storage: storage });

exports.getAllUsers = async function (req, res, next) {
  const users = await userRepository.findAllUsers();

  res.status(200).json({
    status: "success",
    length: users.length,
    data: users,
  });
};

exports.getUserById = async function (req, res, next) {
  const user = await userRepository.findUserById(req.params.id);

  if (user.length === 0) {
    res.status(404).json({
      status: "fail",
      message: "User not found with that id",
    });
  } else {
    res.status(200).json({
      status: "success",
      data: user,
    });
  }
};

exports.createUser = async function (req, res, next) {
  const user = await userRepository.addNewUser(req.body);

  res.status(201).json({
    status: "success",
    data: user,
  });
};

exports.updateUser = async function (req, res, next) {
  upload.single("image")(req, res, async (err) => {
    if (err) {
      // Handle the error if the file upload fails
      console.error(err);
      return next(err);
    }
    
    let convertedPath = "/" + path.relative("src/public", req.file.path);

    console.log(req.params.id);
    console.log(req.body.name);
    console.log(req.body.gender);
    console.log(req.body.dateOfBirth);
    console.log(convertedPath);
    const user = await userRepository.updateUser(req.params.id, {
      name: req.body.name,
      gender: req.body.gender,
      dateOfBirth: req.body.dateOfBirth,
      profilePicture: convertedPath,
    });

    res.status(200).json({
      status: "success",
      data: user,
    });
  });
};
