const { validateEmail } = require("../helpers/validation");
const bcrypt = require("bcrypt");
const User = require("../models/UserModel");
const { generateToken } = require("../helpers/token");
const { request } = require("express");
const mongoose = require("mongoose");
//register
exports.register = async (req, res) => {
  console.log(req.body);
  try {
    const { name, email, password, place, city, state, country } = req.body;
    if (
      email == "" ||
      name == "" ||
      password == "" ||
      place == "" ||
      city == "" ||
      state == "" ||
      country == ""
    ) {
      return res.status(400).json({ message: "Please fill the form" });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Invalid email address" });
    }

    const userName = await User.findOne({ name });
    if (userName) {
      return res
        .status(400)
        .json({ message: "This name is already being used" });
    }
    const check = await User.findOne({ email });
    if (check) {
      return res
        .status(400)
        .json({ message: "This email address is already being used" });
    }
    const cryptedPassword = await bcrypt.hash(password, 12);

    const user = await new User({
      name,
      email,
      password: cryptedPassword,
      place,
      city,
      state,
      country,
    }).save();
    const token = generateToken({ id: user._id.toString() }, "7d");

    res.send({
      id: user._id,
      name: user.name,
      token: token,
      picture: user.picture,
      email: user.email,
      place: user.place,
      city: user.city,
      state: user.state,
      country: user.country,
      message: "Register success!",
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
};

//login
exports.login = async (req, res) => {
  try {
    console.log(req.body);
    const { email, password } = req.body;

    if (email == "" || password == "") {
      return res.status(400).json({ message: "Please  fill the form." });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res
        .status(400)
        .json({ message: "This email is not connected to account" });
    }
    const check = await bcrypt.compare(password, user.password);
    if (!check) {
      return res.status(400).json({ message: "Invalid Credentials" });
    }
    const token = generateToken({ id: user.id.toString() }, "7d");
    res.send({
      id: user._id,
      name: user.name,
      email: user.email,
      token: token,
      picture: user.picture,
      email: user.email,
      place: user.place,
      city: user.city,
      state: user.state,
      country: user.country,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//updating profile Picture

exports.updateProfilePicture = async (req, res) => {
  try {
    const { url } = req.body;
    await User.findByIdAndUpdate(req.user.id, { picture: url });
    res.json(url);
    console.log(url);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//addFriend
exports.addFriend = async (req, res) => {
  
  try {
    
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        !receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({
          $push: { requests: sender._id },
        });
        res.status(200).json({ message: "friend request has been sent" });
      } else {
        return res.status(400).json({ message: "Already sent" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't send a request to yourself" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//cancel friend request
exports.cancelRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.requests.includes(sender._id) &&
        !receiver.friends.includes(sender._id)
      ) {
        await receiver.updateOne({ $pull: { requests: sender._id } });
        res.json({ message: "you successfully cancelled request" });
      } else {
        return res.status(400).json({ message: "Already Cancelled" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't send a  cancel request to yourselves" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//accepting friend request
exports.acceptRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        await receiver.updateOne({
          $push: { friends: sender._id },
        });
        await sender.updateOne({
          $push: { friends: receiver._id },
        });
        await receiver.updateOne({ $pull: { requests: sender._id } });
      }
      return res.status(400).json({ message: "Already friends" });
    } else {
      return res
        .status(400)
        .json({ message: "You can't accept a request from yourselves" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//unFriend
exports.unfriend = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const sender = await User.findById(req.user.id);
      const receiver = await User.findById(req.params.id);
      if (
        receiver.friends.includes(sender._id) &&
        sender.friends.includes(receiver._id)
      ) {
        await receiver.updateOne({
          $pull: {
            friends: sender._id,
          },
        });
        await sender.updateOne({
          $pull: {
            friends: receiver._id,
          },
        });
        res.json({ message: "unfriend request accepted" });
      } else {
        return res.status(400).json({ message: "Already not a friend" });
      }
    } else {
      return res.status(400).json({ message: "You can't unFriend yourselves" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//deleteRequest
exports.deleteRequest = async (req, res) => {
  try {
    if (req.user.id !== req.params.id) {
      const receiver = await User.findById(req.user.id);
      const sender = await User.findById(req.params.id);
      if (receiver.requests.includes(sender._id)) {
        await receiver.updateOne({
          $pull: {
            requests: sender._id,
          },
        });
        res.json({ message: "delete request accepted" });
      } else {
        return res.status(400).json({ message: "Already deleted" });
      }
    } else {
      return res
        .status(400)
        .json({ message: "You can't delete your yourselves" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getFriendsPageInfos = async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
      .select("friends ")
      .populate("friends", "name email place city state country picture")

    //checking if any other users have current user request
    // const sentRequests = await User.find({
    //   requests: mongoose.Types.ObjectId(req.user.id),
    // }).select("name email country place city state picture");

    res.json({
      friends: user.friends,
      // requests: user.requests,
      // sentRequests,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const allUsers = await User.find({ email: { $ne: user.email } })
      .populate("friends", "name email place picture")
      .populate("requests", "name email place picture");
    res.json(allUsers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const { name } = req.params;
   
    
    const user = await User.findById(req.user.id);
    const profile = await User.findOne({ name }).select("-password");
    const friendShip = {
      friends: false,
      requestSent: false,
      requestReceived: false,
    };
    if (!profile) {
      return res.json({ ok: false });
    }
    if (
      user.friends.includes(profile._id) &&
      profile.friends.includes(user._id)
    ) {
      friendShip.friends = true;
    }
    if (user.requests.includes(profile._id)) {
      friendShip.requestReceived = true;
    }
    if (profile.requests.includes(user._id)) {
      friendShip.requestSent = true;
    }

    await profile.populate("friends", "name email place picture");
    res.json({ ...profile.toObject(), friendShip: friendShip });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
