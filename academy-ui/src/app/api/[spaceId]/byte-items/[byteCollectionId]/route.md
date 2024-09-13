
```
{
  itemId: // this will be the byteId or clickableDemoId or shortVideoId
  itemType: // this will be ByteCollectionItemType.Byte or ByteCollectionItemType.ClickableDemo or ByteCollectionItemType.ShortVideo
}
```

* We can then update the byte item mapping and set the archived flag there and also set the archived flag in the byte or clickableDemo or shortVideo table
* Like we do here

```ts
const deleted = await prisma.byte.update({
  where: {
    id: args.byteId,
  },
  data: {
    archive: true,
  },
});
await prisma.byteCollectionItemMappings.updateMany({
  where: {
    itemId: args.byteId,
  },
  data: {
    archive: true,
  },
});
```

This is a generic route and it enables arhive for all the three entities

In the ByteCollectionsCard.tsx
```ts
deleteByteModalState.isVisible
```
This could be created to a generic state. deleteItemModalState. and the state can have itemId and itemType. That way its a generic logic on the UI component as well.
