const fs = require("fs");
const upload = require("@/utils/upload");
const { User, BloodType, Role, File } = require("@models/index");

module.exports = {
  // Index route
  index: async (req, res) => {
    res.json({ message: "Welcome to Users Controller" });
  },

  // Create a new user
  store: async (req, res) => {
    upload.single("file")(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }


      try {
        const data = req.body;
        const newUser = await User.create(data);

        const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;
        if (fileUrl) {
          const newFile = await File.create({
            url: fileUrl,
            table_name: "users",
            user_id: newUser.id,
            type: "project",
          });

          await newUser.update({ photo_id: newFile.id })
        }
        const newUserData = await User.findByPk(newUser.id, {
          attributes: ["id", "first_name", "last_name", "email"],
          include: [
            {
              attributes: ["id", "blood_type"],
              model: BloodType,
              required: false,
            },
            {
              attributes: ["id", "role_name"],
              model: Role,
              required: false,
            },
            {
              attributes: ["id", "url", "type"],
              model: File,
              required: false,
            },
          ],
        });
        res.status(201).json(newUserData);
      } catch (error) {

        if (req.file) {
          fs.unlink(`./public/uploads/${req.file.filename}`, (err) => {
            if (err) console.error("Error deleting file:", err);
          });
        }

        if (error.name === "SequelizeValidationError" || error.name === "SequelizeUniqueConstraintError") {
          const errors = error.errors.reduce((acc, err) => {
            acc[err.path] = err.message;
            return acc;
          }, {});
          res.status(400).json({ errors });
        } else {
          res.status(500).json({ errors: error.message });
        }
      }
    })
  },

  // Get all users
  getAllUsers: async (req, res) => {
    try {
      const users = await User.findAll({
        attributes: ["id", "first_name", "last_name", "email", "full_name"],
        include: [
          {
            attributes: ["id", "blood_type"],
            model: BloodType,
            required: false,
          },
          {
            attributes: ["id", "role_name"],
            model: Role,
            required: false,
          },
        ],
      });
      res.status(200).json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Get a single user by ID
  getUserById: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id, {
        attributes: ["id", "first_name", "last_name", "email"],
        include: [
          {
            attributes: ["id", "blood_type"],
            model: BloodType,
            required: false,
          },
          {
            attributes: ["id", "role_name"],
            model: Role,
            required: false,
          },
          {
            attributes: ["id", "url", "type"],
            model: File,
            required: false,
          },
        ],
      });
      if (user) {
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Update a user by ID
  updateUser: async (req, res) => {
    try {
      const { id } = req.params;
      const data = req.body;
      const user = await User.findByPk(id);
      if (user) {
        await user.update(data);
        res.status(200).json(user);
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },

  // Delete a user by ID
  deleteUser: async (req, res) => {
    try {
      const { id } = req.params;
      const user = await User.findByPk(id);
      if (user) {
        await user.destroy();
        res.status(200).json({ message: "User deleted successfully" });
      } else {
        res.status(404).json({ error: "User not found" });
      }
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
};
