# Swiper fixes

See - academy-ui/src/components/bytes/View/SwiperByteView/SwiperByteStepperItemView.tsx 

Right now we have the following css applied for swiper slides
```css
.swiperSlide {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding-right: 20px;

  @media (min-width: $screen-md) {
    width: 80%;
    max-width: $screen-lg; // Large tablet
  }
}
```

- [ ] Here We want to make sure that the for `min-width: $screen-md` the width of the right navigation should not be more
than 10%.

We have width and height of the screen 

```javascript
const { width, height } = useWindowDimensions();
```

- [ ] We want to make sure that the navigation takes max of 80% of the screen height and then it shows the scroll bar. 
See if there is anything that is there in swiper configuration for this.

- [ ] Space in the navigation items should enable wrapping the text in two lines.(When the title is a bit long). So we
can try reducing the line height of the navigation items by a bit and see how it looks.
