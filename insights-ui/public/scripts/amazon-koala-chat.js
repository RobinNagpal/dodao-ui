(function (w, d, x, id) {
  s = d.createElement('script');
  s.src = 'https://koalagains.my.connect.aws/connectwidget/static/amazon-connect-chat-interface-client.js';
  s.async = 1;
  s.id = id;
  d.getElementsByTagName('head')[0].appendChild(s);
  w[x] =
    w[x] ||
    function () {
      (w[x].ac = w[x].ac || []).push(arguments);
    };
})(window, document, 'amazon_connect', '74fa8d5d-f149-476f-8315-1c1233b3eb09');
amazon_connect('styles', {
  iconType: 'CHAT',
  openChat: { color: '#000000', backgroundColor: '#ffffff' },
  closeChat: { color: '#ffffff', backgroundColor: '#6366f1' },
  headerConfig: { headerMessage: 'How can we help?', headerColorHex: '#6366f1' },
  logoConfig: { sourceUrl: 'https://koalagains.com/images/android-icon-512x512.png' },
});
amazon_connect(
  'snippetId',
  'QVFJREFIak5tL2RUNFhneWV5b2RFSFowb2FxOTY2UTAzQ1gwTko4NUZONTVMYVpydkFIN0tMcjMrSkRjcWhYVCswaDdaZy9EQUFBQWJqQnNCZ2txaGtpRzl3MEJCd2FnWHpCZEFnRUFNRmdHQ1NxR1NJYjNEUUVIQVRBZUJnbGdoa2dCWlFNRUFTNHdFUVFNQWU1dnU2RS9yZGFhMm5ENEFnRVFnQ3ZOeGpKdkFyODZtcjA5NGt0YnBMMnZvL05Ubm90YUFKQjRHSmFmdlZ4T1BMaUErM1ViRjBhaXJTNU46OmNFMFZDbENUVTdZL3NaZmxUZVZiTGZpbmE0R2czMmttM2cwY1FtdHZWKzdRQVJ2R1BodFZrdUhDemVvcDdUZzF6RlA1NG9NMDZwWnIreG5VRVVDUWlTeEVsNnAwbUE0bG14UmhsbEE4eDFGRXpEc3QrSytWbmRNR0Jqci9DOXFyODd6by9rWkxSUEFFTWZnNkhhOHpka2ZWR3JCUVlBTT0='
);
amazon_connect('supportedMessagingContentTypes', [
  'text/plain',
  'text/markdown',
  'application/vnd.amazonaws.connect.message.interactive',
  'application/vnd.amazonaws.connect.message.interactive.response',
]);
amazon_connect(
  'viewConfig',
  '{"name":"Ask for Email","id":"9f7d839c-f5d4-434b-9dca-053a5fcfbc6c","arn":"arn:aws:connect:us-east-1:729763663166:instance/10ad0608-3d2f-4772-9728-b0ce741a49ae/view/9f7d839c-f5d4-434b-9dca-053a5fcfbc6c:$LATEST","type":"CUSTOMER_MANAGED","content":{"template":{"Head":{"Configuration":{"Style":{"--primary-color-50":"#eaeafd","--primary-color-100":"#eaeafd","--primary-color-200":"#cacafa","--primary-color-300":"#a6a7f7","--primary-color-400":"#8084f5","--primary-color-500":"#6366f1","--primary-color-600":"#4747eb","--primary-color-700":"#423edf","--primary-color-800":"#3932d3","--primary-color-900":"#3124c8"},"Layout":{"Columns":[12]}},"Title":"Ask for Email"},"Body":[{"_id":"Form_1759319895884","Type":"Form","Props":{"HideBorder":true},"Content":[{"_id":"email","Type":"FormInput","Props":{"Label":"Your Email","Name":"email","DefaultValue":"","InputType":"email","Required":true,"HelperText":"","ValidationPattern":""},"Content":[]},{"_id":"ConnectAction_1759183752153","Type":"ConnectAction","Props":{"ConnectActionType":"StartChatContact","Label":"Start Chat","StartTaskContactProps":{"ContactFlowId":"","TaskFields":{"Name":"","References":{}},"Attributes":[{"Key":"","Value":""}]},"StartEmailContactProps":{"DestinationEmailAddress":"","ContactFlowId":"","EmailFields":{"CustomerDisplayName":"","CustomerEmailAddress":"","Subject":"","Body":""},"Attributes":[{"Key":"","Value":""}]},"StartChatContactProps":{"ContactFlowId":"arn:aws:connect:us-east-1:729763663166:instance/10ad0608-3d2f-4772-9728-b0ce741a49ae/contact-flow/df4740ae-e216-4e2f-beca-37df92a78e6a","ChatFields":{"CustomerDisplayName":"","InitialMessage":""},"Attributes":[{"Key":"EmailAddress","Value":{"_linkedFormOutputName":"email"}}]}},"Content":["Connect Action Button"]}]}]},"actions":["ActionSelected"],"inputSchema":{"type":"object","properties":{},"required":[],"$defs":{"ViewCondition":{"$id":"/view/condition","type":"object","patternProperties":{"^(MoreThan|LessThan|NotEqual|Equal|Include)$":{"type":"object","properties":{"ElementByKey":{"type":"string"},"ElementByValue":{"anyOf":[{"type":"number"},{"type":"string"}]}},"additionalProperties":false},"^(AndConditions|OrConditions)$":{"type":"array","items":{"$ref":"/view/condition"}}},"additionalProperties":false}}}},"status":"PUBLISHED","viewContentSha256":"ef481e99aa8073b3a449761298d0dddfdcd4bfc385865ff12a63af22bd1f86e4"}'
);
