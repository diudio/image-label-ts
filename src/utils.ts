export const loadImage: (url: string) => Promise<{ width: number; height: number }> = (url) => {
  return new Promise((res) => {
    const image = new Image();
    image.onload = () => {
      res(image);
    };
    image.src = url;
  });
};
