// const pool = require("@config/database");

// module.exports = {
//   fetchAll: async () => {
//     const [rows] = await pool.query("SELECT * FROM sports");
//     return rows;
//   },
// };

const Role = require("@models/RoleModel");
const bcrypt = require("bcrypt");
const saltRounds = 10;

module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define(
        "User",
        {
            id: {
                type: DataTypes.INTEGER,
                autoIncrement: true,
                primaryKey: true,
            },
            blood_type_id: { type: DataTypes.INTEGER, allowNull: true },
            role_id: {
                type: DataTypes.INTEGER,
                allowNull: true,
                validate: {
                    async isValidRole(value) {
                        const role = await Role.findByPk(value);
                        if (!role) {
                            throw new Error("Role field is required.");
                        }
                    },
                },
            },
            first_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                set(value) {
                    const formatted = value
                        .toLowerCase()
                        .split(" ")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ");

                    this.setDataValue("first_name", formatted);
                },
                validate: {
                    notEmpty: {
                        msg: "First Name field is required.",
                    },
                    is: {
                        args: /^[A-Za-z\s]+$/, // Allows only letters and spaces
                        msg: "First Name can only contain letters and spaces.",
                    },
                },
            },
            last_name: {
                type: DataTypes.STRING(50),
                allowNull: false,
                set(value) {
                    const formatted = value
                        .toLowerCase()
                        .split(" ")
                        .map(
                            (word) =>
                                word.charAt(0).toUpperCase() + word.slice(1)
                        )
                        .join(" ");

                    this.setDataValue("last_name", formatted);
                },
                validate: {
                    notEmpty: {
                        msg: "Last Name field is required.",
                    },
                    is: {
                        args: /^[A-Za-z\s]+$/, // Allows only letters and spaces
                        msg: "Last Name can only contain letters and spaces.",
                    },
                },
            },
            middle_name: {
                type: DataTypes.STRING(50),
                allowNull: true,
                validate: {
                    isValid(value) {
                        if (value && !/^[A-Za-z\s]+$/.test(value)) {
                            throw new Error(
                                "Middle Name can only contain letters and spaces."
                            );
                        }
                    },
                },
            },
            prefix: { type: DataTypes.STRING(50), allowNull: true },
            suffix: { type: DataTypes.STRING(50), allowNull: true },
            photo_id: { type: DataTypes.INTEGER, allowNull: true },
            date_of_birth: {
                type: DataTypes.DATEONLY,
                allowNull: true,
                validate: {
                    isDate: true,
                },
            },
            gender: {
                type: DataTypes.ENUM("male", "female"),
                allowNull: false,
                validate: {
                    notEmpty: {
                        msg: "Gender field is required.",
                    },
                },
            },
            is_active: {
                type: DataTypes.TINYINT,
                allowNull: false,
                defaultValue: 1,
            },
            email: {
                type: DataTypes.STRING(250),
                allowNull: false,
                unique: true,
                validate: {
                    isEmail: {
                        msg: "Email field must be a valid email.",
                    },
                },
            },
            password: {
                type: DataTypes.STRING(255),
                allowNull: false,
                validate: {
                    len: {
                        args: [8, 255],
                        msg: "Password must be atleast 8 characters long.",
                    },
                    notEmpty: {
                        msg: "Password field is required.",
                    },
                },
                set(value) {
                    if (value.length >= 8) {
                        const hashedPassword = bcrypt.hashSync(
                            value,
                            saltRounds
                        );
                        this.setDataValue("password", hashedPassword);
                    } else {
                        this.setDataValue("password", value);
                    }
                },
            },
            contact_number: {
                type: DataTypes.STRING(20),
                allowNull: true,
                validate: {
                    len(value) {
                        if (value && (value.length < 11 || value.length > 13)) {
                            throw new Error(
                                "Contact number must be 11-13 characters long."
                            );
                        }
                    },
                    isValidNumber(value) {
                        if (value && !/^[\d+]+$/.test(value)) {
                            throw new Error("Invalid contact number format");
                        }
                    },
                },
            },
            civil_status: {
                type: DataTypes.ENUM(
                    "single",
                    "married",
                    "widowed",
                    "separated"
                ),
                allowNull: false,
                defaultValue: "single",
            },
            weight: { type: DataTypes.DECIMAL(5, 2), allowNull: true },
            health_condition: { type: DataTypes.TEXT, allowNull: true },
            is_eligible: {
                type: DataTypes.ENUM(
                    "eligible",
                    "not-eligible",
                    "for verification"
                ),
                allowNull: false,
                defaultValue: "for verification",
            },
            nationality: { type: DataTypes.STRING(50), allowNull: true },
            occupation: { type: DataTypes.STRING(100), allowNull: true },
            mailing_address: { type: DataTypes.TEXT, allowNull: true },
            home_address: { type: DataTypes.TEXT, allowNull: true },
            office_name: { type: DataTypes.STRING(100), allowNull: true },
            office_address: { type: DataTypes.TEXT, allowNull: true },
            zip_code: { type: DataTypes.STRING(10), allowNull: true },
            type_of_donor: {
                type: DataTypes.ENUM("replacement", "volunteer"),
                allowNull: false,
                defaultValue: "volunteer",
            },
            patient_name: { type: DataTypes.STRING(100), allowNull: true },
            relation: { type: DataTypes.STRING(50), allowNull: true },
            full_name: {
                type: DataTypes.VIRTUAL,
                get() {
                    return `${this.first_name} ${this.last_name}`;
                },
            },
        },
        { timestamps: true, tableName: "users" }
    );

    User.prototype.validPassword = async function (password) {
        const currentPass = this.password;
        // const isValid = await bcrypt.compare(password, currentPass);
        return await bcrypt.compare(password, currentPass);
    };

    // Define associations in the `associate` method
    User.associate = (models) => {
        User.belongsTo(models.BloodType, {
            foreignKey: "blood_type_id",
            onDelete: "SET NULL",
        });
        User.belongsTo(models.Role, {
            foreignKey: "role_id",
            onDelete: "SET NULL",
        });
        User.belongsTo(models.File, {
            foreignKey: "photo_id",
            onDelete: "SET NULL",
        });
    };

    return User;
};

// Relationships
// User.belongsTo(BloodType, {
//     foreignKey: "blood_type_id",
//     onDelete: "SET NULL",
// });
// User.belongsTo(Role, { foreignKey: "role_id", onDelete: "SET NULL" });
// User.belongsTo(File, { foreignKey: "photo_id", onDelete: "SET NULL" });

// BloodType.hasMany(User, { foreignKey: "blood_type_id" });

// Role.hasMany(User, { foreignKey: "role_id" });

// File.belongsTo(User, { foreignKey: "user_id", onDelete: "CASCADE" });

// Menu.hasMany(Submenu, { foreignKey: "menu_id" });
// Submenu.belongsTo(Menu, { foreignKey: "menu_id", onDelete: "CASCADE" });
