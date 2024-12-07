import dummyProfile from '@dodao/web-core/images/default_profile_img.png';

export interface AvatarProps {
  imgUrl: string;
  title?: string;
  onClick?: () => void;
}

export default function Avatar({ imgUrl, title, onClick }: AvatarProps) {
  return (
    <span>
      <img
        alt={title || 'Avatar'}
        title={title || 'Avatar'}
        src={imgUrl || dummyProfile.src}
        className="mx-auto size-6 rounded-full cursor-pointer"
        onClick={onClick || (() => {})}
      />
    </span>
  );
}
