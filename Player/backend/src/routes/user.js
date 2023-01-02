const express = require("express");
const router = express.Router();
const User = require("../models/user");

//Send request to a user

router.put("/:id/request", async (req, res) => {
  // req.body.userId --> ID of Current-User
  // req.params.id --> ID of Requested-User
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);
      if (!user.friendRequests.includes(req.body.userId)) {
        await user.updateOne({ $push: { friendRequests: currentUser._id } });
        await currentUser.updateOne({ $push: { sentRequests: user._id } });
        //   await currentUser.updateOne({ $push: { followings: req.params.id } });
        res.status(200).json("Friend Request has been sent");
      } else {
        res.status(403).json("You have already Requested this user");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot send request to yourself");
  }
});

//Accept request of user

router.put("/:id/accept", async (req, res) => {
  // req.body.userId --> ID of Current-User
  // req.params.id --> ID of Requested-User
  if (req.body.userId !== req.params.id) {
    try {
      const user = await User.findById(req.params.id);
      const currentUser = await User.findById(req.body.userId);

      if (!currentUser.friends.includes(req.params.id)) {
        await currentUser.updateOne({ $pull: { friendRequests: user._id } });

        await currentUser.updateOne({ $push: { friends: user._id } });

        await user.updateOne({ $push: { friends: currentUser._id } });

        await user.updateOne({ $pull: { sentRequests: currentUser._id } });

        res.status(200).json("Friend Request has been accepted");
      } else {
        res.status(403).json("Request cannot be accepted");
      }
    } catch (err) {
      res.status(500).json(err);
    }
  } else {
    res.status(403).json("You cannot become friend of yourself");
  }
});

//get friends
router.get("/friends/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.friends.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, firstName, lastName, username, email, profilePicture } =
        friend;
      friendList.push({
        _id,
        firstName,
        lastName,
        username,
        email,
        profilePicture,
      });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get friend Requests
router.get("/friendRequests/:userId", async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    const friends = await Promise.all(
      user.friendRequests.map((friendId) => {
        return User.findById(friendId);
      })
    );
    let friendList = [];
    friends.map((friend) => {
      const { _id, firstName, lastName, username, email, profilePicture } =
        friend;
      friendList.push({
        _id,
        firstName,
        lastName,
        username,
        email,
        profilePicture,
      });
    });
    res.status(200).json(friendList);
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all users
router.get("/users", async (req, res) => {
  try {
    User.find().exec((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Error in Displaying Users",
          Err: error,
        });
      } else {
        return res.status(200).json(user);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

//get all non-friend users
router.get("/nonFriends/:userId", async (req, res) => {
  try {
    // Current logged-in user
    const user = await User.findById(req.params.userId);

    User.find({
      $and: [
        { _id: { $nin: user.friendRequests } },
        { _id: { $nin: user.sentRequests } },
        { _id: { $nin: user.friends } },
      ],
    }).exec((error, user) => {
      if (error) {
        return res.status(400).json({
          message: "Error in Displaying Non-Friend Users",
          Err: error,
        });
      } else {
        return res.status(200).json(user);
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

// Edit the profile of user
router.put("/:id/edit", async (req, res) => {
  User.findOneAndUpdate(
    { _id: req.params.id },
    {
      $set: {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        profilePicture: req.body.profilePicture,
      },
    },
    { new: true },
    (err, ans) => {
      if (err) {
        res.send(err);
      } else return res.status(200).json(ans);
    }
  );
});


module.exports = router;
