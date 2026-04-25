import { ImageManager } from "@/components/dashboard/image-manager";
import { menuByCategory } from "@/data/menu-data";

export default function MenuImagesPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-stone-50">Menu Images</h1>
        <p className="mt-1 text-sm text-stone-400">
          Upload photos for each dish. Images go live instantly — no restart needed.
        </p>
      </div>
      <ImageManager categories={menuByCategory} />
    </div>
  );
}
