const { User, BloodType, Role } = require("@models/index");

module.exports = {
    // Index route
    index: async (req, res) => {
        res.json({ message: "Welcome to Role Controller" });
    },

    // Create a new role
    store: async (req, res) => {
        try {
            const data = req.body;
            const newRole = await Role.create(data);
            res.status(201).json(newRole);
        } catch (error) {
            if (
                error.name === "SequelizeValidationError" ||
                error.name === "SequelizeUniqueConstraintError"
            ) {
                const errors = error.errors.reduce((acc, err) => {
                    if (error.name === "SequelizeUniqueConstraintError") {
                        acc[err.path] = `${err.path} already exists!`;
                    } else {
                        acc[err.path] = err.message;
                    }
                    return acc;
                }, {});
                res.status(400).json({ errors });
            } else {
                res.status(500).json({ errors: error.message });
            }
        }
    },

    // Get all users
    getAllRoles: async (req, res) => {
        try {
            const roles = await Role.findAll({
                attributes: ["id", "role_name", "icon"],
                include: [
                    {
                        attributes: [
                            "id",
                            "full_name",
                            "first_name",
                            "last_name",
                        ],
                        model: User,
                        required: false,
                    },
                ],
            });

            res.status(200).json(roles);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Get a single user by ID
    getRoleById: async (req, res) => {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id, {
                attributes: ["id", "role_name"],
            });
            if (role) {
                res.status(200).json(role);
            } else {
                res.status(404).json({ error: "Role not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },

    // Update a user by ID
    updateRole: async (req, res) => {
        try {
            const { id } = req.params;
            const data = req.body;
            const role = await Role.findByPk(id);
            if (role) {
                await role.update(data);
                res.status(200).json(role);
            } else {
                res.status(404).json({ error: "Role not found" });
            }
        } catch (error) {
            if (
                error.name === "SequelizeValidationError" ||
                error.name === "SequelizeUniqueConstraintError"
            ) {
                const errors = error.errors.reduce((acc, err) => {
                    if (error.name === "SequelizeUniqueConstraintError") {
                        acc[err.path] = `${err.path} already exists!`;
                    } else {
                        acc[err.path] = err.message;
                    }
                    return acc;
                }, {});
                res.status(500).json({ errors });
            } else {
                res.status(500).json({ errors: error.message });
            }
        }
    },

    // Delete a user by ID
    deleteRole: async (req, res) => {
        try {
            const { id } = req.params;
            const role = await Role.findByPk(id);
            if (role) {
                await role.destroy();
                res.status(200).json({ message: "Role deleted successfully" });
            } else {
                res.status(404).json({ error: "Role not found" });
            }
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    },
};
