const mongoose = require('mongoose');
const crypto = require('crypto');

const ActivitySchema = new mongoose.Schema({
    id: { type: String },
    title: { type: String },
    content: {
        type: String,
    },
    date: { type: String },
    noteColor: { type: String },
    noteContent: { type: String },
    members: Array,
});

const ColumnsSchema = new mongoose.Schema({
    id: { type: String },
    title: { type: String },
    color: { type: String },
    activityIDs: Array,
});

const userSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        email: {
            type: String,
            trim: true,
            required: true,
            unique: true,
            lowercase: true,
        },
        role: {
            type: String,
            default: 'member',
            required: true,
        },
        hashed_password: {
            type: String,
            required: true,
        },
        salt: {
            type: String,
            required: true,
        },
        passwordResetLink: {
            data: String,
            default: '',
        },
        teams: Array,
        boards: [
            {
                title: {
                    type: String,
                },
                activities: [ActivitySchema],
                columns: [ColumnsSchema],
                columnOrder: Array,
            },
        ],
    },
    { timestamps: true }
);

userSchema.pre('save', function (next) {
    const ObjectId = mongoose.Types.ObjectId;
    const newID = new ObjectId();

    if (Object.entries(this.boards).length == 0)
        this.boards.push({
            title: 'Example Board',
            activities: [],
            columns: [
                {
                    _id: newID,
                    title: 'Example Column',
                    color: '#3f51b5',
                },
            ],
            columnOrder: [newID],
        });

    next();
});

// Virtual accessing hashed password
userSchema
    .virtual('password')
    .set(function (password) {
        this._password = password;
        this.salt = this.makeSalt();
        this.hashed_password = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

// Check that encrypted password equals to the stored hashed password
userSchema.methods.checkPassword = function checkPassword(password) {
    return this.encryptPassword(password) === this.hashed_password; // true false
};

// Encrypt password
userSchema.methods.encryptPassword = function encryptPassword(password) {
    if (!password) return '';
    try {
        return crypto
            .createHmac('sha1', this.salt)
            .update(password)
            .digest('hex');
    } catch (err) {
        return '';
    }
};

// Make Salt of password
userSchema.methods.makeSalt = function makeSalt(password) {
    return Math.round(new Date().valueOf() * Math.random()) + '';
};

const User = mongoose.model('User', userSchema);

module.exports = User;
