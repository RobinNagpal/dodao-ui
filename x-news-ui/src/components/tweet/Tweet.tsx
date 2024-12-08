import PrivateEllipsisDropdown from "@/components/core/dropdowns/PrivateEllipsisDropdown";
import PrimaryColorBadge from "@dodao/web-core/components/core/badge/PrimaryColorBadge";
import Avatar from "@dodao/web-core/components/core/avatar/Avatar";
import { TweetSummary } from "@/types/tweets/tweet";
import { formatDate, formatDateIntoRelativeTime } from "@/utils/date-formatter";

interface TweetProps {
  tweet: TweetSummary;
  threeDotItems: { label: string; key: string }[];
  openItemDeleteModal: (itemId: string, itemName: string) => void;
  openItemUnarchiveModal: (itemId: string, itemName: string) => void;
  isAdmin?: boolean;
}

export default function Tweet(props: TweetProps) {
  const {
    tweet,
    threeDotItems,
    openItemDeleteModal,
    openItemUnarchiveModal,
    isAdmin,
  } = props;
  const modifiedThreeDotItems = JSON.parse(JSON.stringify(threeDotItems)); // Creating a deep copy so that it doesn't affect the original array
  if (tweet.archive) {
    modifiedThreeDotItems.pop();
    modifiedThreeDotItems.push({ label: "Unarchive", key: "unarchive" });
  }

  return (
    <li key={tweet.id}>
      <div className="relative pb-6">
        <div className="relative flex space-x-3 justify-between">
          <Avatar imgUrl={tweet.userAvatar} title={`@${tweet.userUsername}`} />
          <div className="flex min-w-0 flex-1 justify-between space-x-2 duration-300 ease-in-out">
            <div className="ml-3 text-sm group">
              <div className="flex items-center gap-x-2">
                <a
                  href={`https://x.com/${tweet.userUsername}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <div className="font-bold hover:underline">
                    {tweet.userDisplayName}
                  </div>
                </a>
                <div className="text-gray-500">@{tweet.userUsername}</div>
                <div className="text-gray-500">-</div>
                <div
                  className="text-gray-500 hover:underline"
                  title={formatDate(tweet.date)}
                >
                  {formatDateIntoRelativeTime(tweet.date)}
                </div>
              </div>
              <a href={tweet.url} target="_blank" rel="noopener noreferrer">
                <div className="flex-wrap">{tweet.content}</div>
              </a>
            </div>
          </div>

          <div className="flex">
            {tweet?.archive && isAdmin && (
              <PrimaryColorBadge
                onClick={() =>
                  openItemUnarchiveModal(tweet.id, tweet.userUsername)
                }
              >
                Archived
              </PrimaryColorBadge>
            )}
            {tweet.id && (
              <PrivateEllipsisDropdown
                items={modifiedThreeDotItems}
                onSelect={(key) => {
                  if (key === "archive") {
                    openItemDeleteModal(tweet.id, tweet.userUsername);
                  } else if (key === "unarchive") {
                    openItemUnarchiveModal(tweet.id, tweet.userUsername);
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </li>
  );
}
