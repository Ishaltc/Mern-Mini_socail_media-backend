const express = require("express");
const {
  register,
  login,
  updateProfilePicture,
  addFriend,
  cancelRequest,
  acceptRequest,
  unfriend,
  deleteRequest,
  getFriendsPageInfos,
  getAllUsers,
  getProfile,
} = require("../controllers/user");
const { authUser } = require("../middleware/auth");
const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.put("/updateProfilePicture", authUser, updateProfilePicture);
router.put("/addFriend/:id", authUser, addFriend);
router.put("/cancelRequest/:id", authUser, cancelRequest);
router.put("/acceptRequest/:id", authUser, acceptRequest);
router.put("/unfriend/:id", authUser, unfriend);
router.put("/deleteRequest/:id", authUser, deleteRequest);
router.get("/getFriendsPageInfos", authUser, getFriendsPageInfos);
router.get("/getAllUsers", authUser, getAllUsers);
router.get("/getProfile/:name", authUser, getProfile)
module.exports = router;
