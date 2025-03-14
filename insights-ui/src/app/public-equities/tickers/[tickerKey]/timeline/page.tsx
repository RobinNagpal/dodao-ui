import PageWrapper from '@dodao/web-core/components/core/page/PageWrapper';
import classNames from '@dodao/web-core/utils/classNames';
import { Fragment } from 'react';
import { ChatBubbleLeftEllipsisIcon, TagIcon, UserCircleIcon } from '@heroicons/react/20/solid';

const filings = [
  {
    id: '764d586a-c773-4874-947c-eda64a36eaf2',
    tickerKey: 'FVR',
    filingDate: '2025-02-27T00:00:00.000Z',
    form: '8-K',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017025029229/fvr-20250227.htm',
    accessionNumber: '0000950170-25-029229',
    periodOfReport: '2025-02-27',
  },
  {
    id: 'b5fae53f-9977-4e9a-9e44-b2bf33fcea62',
    tickerKey: 'FVR',
    filingDate: '2025-02-14T00:00:00.000Z',
    form: 'SCHEDULE 13G/A',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000114036125004948/primary_doc.xml',
    accessionNumber: '0001140361-25-004948',
    periodOfReport: 'None',
  },
  {
    id: 'd403e4fe-5943-4b38-b7bc-1ec3c26d53dd',
    tickerKey: 'FVR',
    filingDate: '2025-02-14T00:00:00.000Z',
    form: 'SCHEDULE 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000131586325000174/primary_doc.xml',
    accessionNumber: '0001315863-25-000174',
    periodOfReport: 'None',
  },
  {
    id: '8379eaf4-fa5b-4f65-83cb-1151944e469e',
    tickerKey: 'FVR',
    filingDate: '2025-02-14T00:00:00.000Z',
    form: 'SCHEDULE 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000117266125001183/primary_doc.xml',
    accessionNumber: '0001172661-25-001183',
    periodOfReport: 'None',
  },
  {
    id: 'ef40cf86-33f2-48e4-9687-93fa255d4b44',
    tickerKey: 'FVR',
    filingDate: '2025-02-07T00:00:00.000Z',
    form: 'SCHEDULE 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000204732925000002/primary_doc.xml',
    accessionNumber: '0002047329-25-000002',
    periodOfReport: 'None',
  },
  {
    id: '86c2f292-e4ac-4048-9cdf-1f8da66a4e2d',
    tickerKey: 'FVR',
    filingDate: '2025-02-04T00:00:00.000Z',
    form: 'SCHEDULE 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000201238325000632/primary_doc.xml',
    accessionNumber: '0002012383-25-000632',
    periodOfReport: 'None',
  },
  {
    id: '0e5a31d8-05f3-4ec4-8d4f-a4a621c31268',
    tickerKey: 'FVR',
    filingDate: '2025-01-30T00:00:00.000Z',
    form: 'SCHEDULE 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000093247125000113/primary_doc.xml',
    accessionNumber: '0000932471-25-000113',
    periodOfReport: 'None',
  },
  {
    id: '3c90093b-7fd4-4c0a-978e-c6b0f03ff69d',
    tickerKey: 'FVR',
    filingDate: '2025-01-10T00:00:00.000Z',
    form: '8-K',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017025004128/fvr-20250109.htm',
    accessionNumber: '0000950170-25-004128',
    periodOfReport: '2025-01-09',
  },
  {
    id: '243080af-20cd-465d-b4da-c1bebf483587',
    tickerKey: 'FVR',
    filingDate: '2024-11-21T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000598/form4.xml',
    accessionNumber: '0000895345-24-000598',
    periodOfReport: '2024-11-21',
  },
  {
    id: 'a92bded8-fc3a-4de9-bf3c-676da781dcea',
    tickerKey: 'FVR',
    filingDate: '2024-11-18T00:00:00.000Z',
    form: '8-K',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017024128052/fvr-20241118.htm',
    accessionNumber: '0000950170-24-128052',
    periodOfReport: '2024-11-18',
  },
  {
    id: 'af7085bc-b70a-4032-917c-1d94c5189ddd',
    tickerKey: 'FVR',
    filingDate: '2024-11-14T00:00:00.000Z',
    form: '10-Q',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017024127114/fvr-20240930.htm',
    accessionNumber: '0000950170-24-127114',
    periodOfReport: '2024-09-30',
  },
  {
    id: 'e70fd942-fc27-4810-9bb8-99da29818092',
    tickerKey: 'FVR',
    filingDate: '2024-11-13T00:00:00.000Z',
    form: '8-K',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017024126510/fvr-20241113.htm',
    accessionNumber: '0000950170-24-126510',
    periodOfReport: '2024-11-13',
  },
  {
    id: 'dd5de55d-6992-4729-9d56-b40a04b21e33',
    tickerKey: 'FVR',
    filingDate: '2024-11-07T00:00:00.000Z',
    form: 'SC 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000031506624002583/filing.txt',
    accessionNumber: '0000315066-24-002583',
    periodOfReport: 'None',
  },
  {
    id: '2c22d146-e735-4ea1-94df-bc7efee65a21',
    tickerKey: 'FVR',
    filingDate: '2024-10-23T00:00:00.000Z',
    form: '8-K',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017024116722/fvr-20241023.htm',
    accessionNumber: '0000950170-24-116722',
    periodOfReport: '2024-10-23',
  },
  {
    id: '4b2577a5-5703-4400-9db2-250dcfe72b3e',
    tickerKey: 'FVR',
    filingDate: '2024-10-17T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000438/form4.xml',
    accessionNumber: '0000895345-24-000438',
    periodOfReport: '2024-10-15',
  },
  {
    id: '9cf8da4f-c771-4ecf-a0fe-b7ad7882779a',
    tickerKey: 'FVR',
    filingDate: '2024-10-11T00:00:00.000Z',
    form: '3',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000031206924000136/primary_doc.xml',
    accessionNumber: '0000312069-24-000136',
    periodOfReport: '2024-10-03',
  },
  {
    id: 'fdfa0ccc-7972-414b-8413-e9d03b012e80',
    tickerKey: 'FVR',
    filingDate: '2024-10-11T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000031206924000137/primary_doc.xml',
    accessionNumber: '0000312069-24-000137',
    periodOfReport: '2024-10-04',
  },
  {
    id: '82032d10-d6a7-4171-85a1-560a4bc2446d',
    tickerKey: 'FVR',
    filingDate: '2024-10-10T00:00:00.000Z',
    form: 'SC 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000110465924107715/tm2425985d1_sc13g.htm',
    accessionNumber: '0001104659-24-107715',
    periodOfReport: 'CITADEL ADVISORS HOLDINGS LPCITADEL GP LLCCITADEL SECURITIES GP LLCCITADEL SECURITIES GROUP LPCITADEL SECURITIES LLCKENNETH GRIFFIN',
  },
  {
    id: '1b3d2ad7-9b01-4850-b2be-7f3b25b6fced',
    tickerKey: 'FVR',
    filingDate: '2024-10-10T00:00:00.000Z',
    form: 'SC 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000127308724000096/FVR_SC13G.htm',
    accessionNumber: '0001273087-24-000096',
    periodOfReport: 'ISRAEL A. ENGLANDERMILLENNIUM GROUP MANAGEMENT LLCMILLENNIUM MANAGEMENT LLC',
  },
  {
    id: '33bc4db4-f41e-48d3-a4df-0e027873fe2b',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000405/form4.xml',
    accessionNumber: '0000895345-24-000405',
    periodOfReport: '2024-10-04',
  },
  {
    id: '194f2c77-494f-4d28-b10e-47e449031c26',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000404/form4.xml',
    accessionNumber: '0000895345-24-000404',
    periodOfReport: '2024-10-04',
  },
  {
    id: '7c93879b-3903-496a-910e-f732daa0f70f',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017024113600/ownership.xml',
    accessionNumber: '0000950170-24-113600',
    periodOfReport: '2024-10-03',
  },
  {
    id: '560c0b0f-41ef-4d78-ad8a-78c0d7db18d9',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '3',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000095017024113596/ownership.xml',
    accessionNumber: '0000950170-24-113596',
    periodOfReport: '2024-10-02',
  },
  {
    id: '3b90081c-51a4-4e8a-ac68-ce24c42f591e',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: 'SC 13G',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000114036124043054/ef20036801_sc13g.htm',
    accessionNumber: '0001140361-24-043054',
    periodOfReport: 'None',
  },
  {
    id: '05aa5d5f-f460-4573-8179-fa4dc8a78b97',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000407/form4.xml',
    accessionNumber: '0000895345-24-000407',
    periodOfReport: '2024-10-04',
  },
  {
    id: 'f445c3e2-d531-4dbf-9c74-eea417837599',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000408/form4.xml',
    accessionNumber: '0000895345-24-000408',
    periodOfReport: '2024-10-04',
  },
  {
    id: 'bb7c796e-eb5b-49cf-9984-58b2833492ef',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000409/form4.xml',
    accessionNumber: '0000895345-24-000409',
    periodOfReport: '2024-10-04',
  },
  {
    id: '3389bc71-f6ca-4322-a94b-c11390eb39cb',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000410/form4.xml',
    accessionNumber: '0000895345-24-000410',
    periodOfReport: '2024-10-04',
  },
  {
    id: 'ff314a3c-ebeb-45f6-acba-26ebe76891ae',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000411/form4.xml',
    accessionNumber: '0000895345-24-000411',
    periodOfReport: '2024-10-08',
  },
  {
    id: 'cc794d8d-4eb4-4406-b1bf-3aab1533ead5',
    tickerKey: 'FVR',
    filingDate: '2024-10-08T00:00:00.000Z',
    form: '4',
    filingUrl: 'https://www.sec.gov/Archives/edgar/data/1988494/000089534524000412/form4.xml',
    accessionNumber: '0000895345-24-000412',
    periodOfReport: '2024-10-04',
  },
];

export default function TimelinePage() {
  const activity = [
    {
      id: 1,
      type: 'comment',
      person: { name: 'Eduardo Benz', href: '#' },
      imageUrl:
        'https://images.unsplash.com/photo-1520785643438-5bf77931f493?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. ',
      date: '6d ago',
    },
    {
      id: 2,
      type: 'assignment',
      person: { name: 'Hilary Mahy', href: '#' },
      assigned: { name: 'Kristin Watson', href: '#' },
      date: '2d ago',
    },
    {
      id: 3,
      type: 'tags',
      person: { name: 'Hilary Mahy', href: '#' },
      tags: [
        { name: 'Bug', href: '#', color: 'fill-red-500' },
        { name: 'Accessibility', href: '#', color: 'fill-indigo-500' },
      ],
      date: '6h ago',
    },
    {
      id: 4,
      type: 'comment',
      person: { name: 'Jason Meyers', href: '#' },
      imageUrl:
        'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80',
      comment:
        'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Tincidunt nunc ipsum tempor purus vitae id. Morbi in vestibulum nec varius. Et diam cursus quis sed purus nam. Scelerisque amet elit non sit ut tincidunt condimentum. Nisl ultrices eu venenatis diam.',
      date: '2h ago',
    },
  ];

  return (
    <PageWrapper>
      <div className="flow-root background-color">
        <ul role="list" className="-mb-8">
          {activity.map((activityItem, activityItemIdx) => (
            <li key={activityItem.id}>
              <div className="relative pb-8">
                {activityItemIdx !== activity.length - 1 ? <span aria-hidden="true" className="absolute left-5 top-5 -ml-px h-full w-0.5 divider-bg" /> : null}
                <div className="relative flex items-start space-x-3">
                  {activityItem.type === 'comment' ? (
                    <>
                      <div className="relative">
                        <img
                          alt=""
                          src={activityItem.imageUrl}
                          className="flex size-10 items-center justify-center rounded-full block-bg-color ring-8 ring-white"
                        />
                        <span className="absolute -bottom-0.5 -right-1 rounded-tl bg-primary-text px-0.5 py-px">
                          <ChatBubbleLeftEllipsisIcon aria-hidden="true" className="size-5 text-color" />
                        </span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm">
                          <a href={activityItem.person.href} className="font-medium heading-color">
                            {activityItem.person.name}
                          </a>
                        </div>
                        <p className="mt-0.5 text-sm text-color">Commented {activityItem.date}</p>
                        <div className="mt-2 text-sm text-color">
                          <p>{activityItem.comment}</p>
                        </div>
                      </div>
                    </>
                  ) : activityItem.type === 'assignment' ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full block-bg-color ring-8 ring-white">
                            <UserCircleIcon aria-hidden="true" className="size-5 text-color" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-1.5">
                        <div className="text-sm text-color">
                          <a href={activityItem.person.href} className="font-medium heading-color">
                            {activityItem.person.name}
                          </a>{' '}
                          assigned{' '}
                          <a href={activityItem.assigned?.href} className="font-medium heading-color">
                            {activityItem.assigned?.name}
                          </a>{' '}
                          <span className="whitespace-nowrap">{activityItem.date}</span>
                        </div>
                      </div>
                    </>
                  ) : activityItem.type === 'tags' ? (
                    <>
                      <div>
                        <div className="relative px-1">
                          <div className="flex size-8 items-center justify-center rounded-full block-bg-color ring-8 ring-white">
                            <TagIcon aria-hidden="true" className="size-5 text-color" />
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0 flex-1 py-0">
                        <div className="text-sm/8 text-color">
                          <span className="mr-0.5">
                            <a href={activityItem.person.href} className="font-medium heading-color">
                              {activityItem.person.name}
                            </a>{' '}
                            added tags
                          </span>{' '}
                          <span className="mr-0.5">
                            {activityItem.tags?.map((tag) => (
                              <Fragment key={tag.name}>
                                <a
                                  href={tag.href}
                                  className="inline-flex items-center gap-x-1.5 rounded-full px-2 py-1 text-xs font-medium heading-color ring-1 ring-inset ring-border"
                                >
                                  <svg viewBox="0 0 6 6" aria-hidden="true" className={classNames(tag.color, 'size-1.5')}>
                                    <circle r={3} cx={3} cy={3} />
                                  </svg>
                                  {tag.name}
                                </a>{' '}
                              </Fragment>
                            ))}
                          </span>
                          <span className="whitespace-nowrap">{activityItem.date}</span>
                        </div>
                      </div>
                    </>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </PageWrapper>
  );
}
