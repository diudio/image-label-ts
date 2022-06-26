export const loadImage = (url) => {
    return new Promise((res) => {
        const image = new Image();
        image.onload = () => {
            res(image);
        };
        image.src = url;
    });
};
//# sourceMappingURL=utils.js.map