import DateFormatter from "./date-formatter";

type Props = {
  name: string;
  picture: string;
  date?: string;
};

const Avatar = ({ name, picture, date }: Props) => {
  return (
    <div className="flex items-center">
      <img src={picture} className="w-12 h-12 rounded-full mr-4" alt={name} />
      <div className="flex items-center gap-3 text-lg">
        <span className="font-bold">{name}</span>
        {date && (
          <>
            <span className="text-neutral-300 dark:text-neutral-600">•</span>
            <span className="text-neutral-600 dark:text-neutral-400">
              <DateFormatter dateString={date} />
            </span>
          </>
        )}
      </div>
    </div>
  );
};

export default Avatar;
