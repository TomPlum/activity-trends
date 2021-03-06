export class Numbers {
    static randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);

    static isValidNumber = (value) => !!value && !isNaN(Number(value))
}