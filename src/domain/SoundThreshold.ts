export enum SoundThreshold {
    UPPER = 30,
    MIDDLE = 10,
    LOWER = 5,
    FLOOR = 0
}

export namespace SoundThreshold {
    export function getThreshold(quantity) {
        if (quantity >= SoundThreshold.LOWER && quantity < SoundThreshold.MIDDLE) {
            return SoundThreshold.LOWER;
        }
    
        if (quantity >= SoundThreshold.MIDDLE && quantity < SoundThreshold.UPPER) {
            return SoundThreshold.MIDDLE;
        }
    
        if (quantity >= SoundThreshold.UPPER) {
            return SoundThreshold.UPPER;
        }
    
        return SoundThreshold.FLOOR;
    }
}


