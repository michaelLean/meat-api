import * as mongoose from 'mongoose';

export interface MenuItem extends mongoose.Document {
    name: string;
    price: number;
}

const menuItemSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true,
        min: 0
    }
})

export interface Restaurant extends mongoose.Document {
    name: string;
    menu: MenuItem[]
}

const restaurantSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    menu: {
        type: [menuItemSchema],
        required: false,
        select: false,
        default: []
    }
})

export const Restaurant = mongoose.model<Restaurant>('Restaurant', restaurantSchema);