const mongoose = require('mongoose');

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

const teamSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
            required: true,
            max: 32,
        },
        members: { type: Array, required: true },
        boards: [
            {
                title: {
                    type: String,
                },
                activities: [ActivitySchema],
                columns: [ColumnsSchema],
                columnOrder: { type: Array, default: [] },
            },
        ],
    },
    { timestamps: true }
);

teamSchema.pre('save', function (next) {
    const ObjectId = mongoose.Types.ObjectId;
    const newID = new ObjectId();

    if (Object.entries(this.boards).length == 0)
        this.boards.push({
            title: 'Example Board',
            activities: [],
            columns: [
                { _id: newID, title: 'Example Column', color: '#3f51b5' },
            ],
            columnOrder: [newID],
        });

    next();
});

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;
