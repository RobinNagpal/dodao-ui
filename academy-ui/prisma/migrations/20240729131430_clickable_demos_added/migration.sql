-- AddForeignKey
ALTER TABLE "byte_collections_items_mappings" ADD CONSTRAINT "FK_ClickableDemos" FOREIGN KEY ("itemId") REFERENCES "clickable_demos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
