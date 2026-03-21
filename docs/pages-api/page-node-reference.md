# Page Node Reference

Source: https://developers.facebook.com/docs/graph-api/reference/page

# Page

Represents a [Facebook Page](https://www.facebook.com/help/282489752085908/).

Over the coming months, all classic Pages will be migrated to the New Pages Experience. Use the `has_transitioned_to_new_page_experience` Page field to determine if a Page has been migrated. After all Pages have been migrated, the classic Pages experience will no longer be available.

Refer to our [Pages API Guides](https://developers.facebook.com/docs/pages) for additional usage information.

## Reading



Get information about a Facebook Page.




### Requirements

- For apps that have been granted the

[`pages_read_engagement`](https://developers.facebook.com/docs/graph-api/reference/page/#)

and

[`pages_read_user_content`](https://developers.facebook.com/docs/graph-api/reference/page/#)

permissions, only data owned by the Page is accessible.

- For apps that have been approved for either the

[Page Public Content Access (PPCA)](https://developers.facebook.com/docs/graph-api/reference/page/#)

or

[Page Public Metadata Access (PPMA)](https://developers.facebook.com/docs/graph-api/reference/page/#)

feature, only public data is accessible.
[Learn more.](https://developers.facebook.com/docs/pages/overview/permissions-features#features)

- The `instagram_business_account` field requires a User access token from a User who is able to perform appropriate [tasks](https://developers.facebook.com/docs/instagram-api/overview#tasks) on the Page. Refer to the Instagram Graph API's [Page reference](https://developers.facebook.com/docs/instagram-api/reference/page) for more information.


- If using a [business system user](https://www.facebook.com/business/help/327596604689624) in your request, the [`business_management` permission](https://developers.facebook.com/docs/permissions/reference/business_management) may be required.


#### Limitations

- A Page access token is required for any fields that may include User information.

- All users requesting access to a Page using permissions must be able to perform the

[`MODERATE` task](https://developers.facebook.com/docs/graph-api/reference/page/#)

on the Page being queried.

- When using the Page Public Content Access feature, use a [system user access token](https://www.facebook.com/business/help/503306463479099) to avoid [rate limiting](https://developers.facebook.com/docs/graph-api/overview/rate-limiting#pages) issues.

- If the page url is being used as the query input, ensure the page url is set up the following way: facebook.com/<pageusername>. More information on the [page username.](https://www.facebook.com/help/121237621291199)


#### Public Page Data

Requirements vary based on the Page's status, unpublished or published, and unrestricted or restricted. Restrictions include any visibility restrictions such as by age or region. Note that for restricted Pages, the app user must also satisfy any restrictions in order for data to be returned.

| Page Status | Access Token | Feature, to retrieve public data | Permissions, to retrieve Page owned data |
| --- | --- | --- | --- |
| Unpublished | [Page Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#pagetokens) or [User Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#usertokens) | None | None |
| Published, Unrestricted | [App Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#apptokens) or <br>[User Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#usertokens) | PPCA or PPMA | [`pages_read_engagement`](https://developers.facebook.com/docs/permissions/reference/pages_read_engagement) [`pages_read_user_content`](https://developers.facebook.com/docs/permissions/reference/pages_read_user_content) [`pages_show_list`](https://developers.facebook.com/docs/permissions/reference/pages_show_list) |
| Published, Restricted | [Page Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#pagetokens) or [User Access Token](https://developers.facebook.com/docs/facebook-login/access-tokens#usertokens). | PPCA or PPMA | [`pages_read_engagement`](https://developers.facebook.com/docs/permissions/reference/pages_read_engagement) [`pages_read_user_content`](https://developers.facebook.com/docs/permissions/reference/pages_read_user_content) [`pages_show_list`](https://developers.facebook.com/docs/permissions/reference/pages_show_list) |

### Example

```code
curl -i -X GET "https://graph.facebook.com/PAGE-ID?access_token=ACCESS-TOKEN"
```

### Parameters

| Parameter | Description |
| --- | --- |
| `account_linking_token`<br>UTF-8 encoded string | Short lived account linking token (5 mins expiry) to get the PSID for a user-page pair |

### Fields

| Field | Description |
| --- | --- |
| `id`<br>numeric string | The ID representing a Facebook Page. |
| `about`<br>string | Information about the Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). This value maps to the **Description** setting in the **Edit Page Info** user interface. Limit of 100 characters. |
| `access_token`<br>string | The Page's access token. Only returned if the User making the request has a role (other than Live Contributor) on the Page. If your business requires two-factor authentication, the User must also be authenticated |
| `ad_campaign`<br>[AdSet](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/) | The Page's currently running an ad campaign |
| `affiliation`<br>string | Affiliation of this person. Applicable to Pages representing people. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `app_id`<br>id | App ID for app-owned Pages and app Pages |
| `artists_we_like`<br>string | Artists the band likes. Applicable to Bands. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `attire`<br>string | Dress code of the business. Applicable to Restaurants or Nightlife. Can be one of Casual, Dressy or Unspecified. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `available_promo_offer_ids`<br>list<KeyValue:enum,list<KeyValue:string,string>> | available\_promo\_offer\_ids |
| `awards`<br>string | The awards information of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `band_interests`<br>string | Band interests. Applicable to Bands. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `band_members`<br>string | Members of the band. Applicable to Bands. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `best_page`<br>[Page](https://developers.facebook.com/docs/graph-api/reference/page/) | The best available Page on Facebook for the concept represented by this Page. The best available Page takes into account authenticity and the number of likes |
| `birthday`<br>string | Birthday of this person. Applicable to Pages representing people. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `booking_agent`<br>string | Booking agent of the band. Applicable to Bands. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `breaking_news_usage`<br>null | Information about the availability of daily and monthly usages of the breaking news indicator<br>Deprecated |
| `built`<br>string | Year vehicle was built. Applicable to Vehicles. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `business` | The Business associated with this Page. Requires business\_management permissions, and a page or user access token. The person requesting the access token must be an admin of the page. |
| `can_checkin`<br>bool | Whether the Page has checkin functionality enabled. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `can_post`<br>bool | Indicates whether the current app user can post on this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `category`<br>string | The Page's category. e.g. Product/Service, Computers/Technology. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access).<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| `category_list`<br>[list<PageCategory>](https://developers.facebook.com/docs/graph-api/reference/page-category/) | The Page's sub-categories. This field will not return the parent category. |
| `checkins`<br>unsigned int32 | Number of checkins at a place represented by a Page<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| `company_overview`<br>string | The company overview. Applicable to Companies. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `connected_instagram_account`<br>[IGUser](https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user/) | Instagram account connected to page via page settings |
| `connected_page_backed_instagram_account`<br>[IGUser](https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user/) | Linked page backed instagram account for this page |
| `contact_address`<br>[MailingAddress](https://developers.facebook.com/docs/graph-api/reference/mailing-address/) | The mailing or contact address for this page. This field will be blank if the contact address is the same as the physical address |
| `copyright_attribution_insights`<br>CopyrightAttributionInsights | Insight metrics that measures performance of copyright attribution. An example metric would be number of incremental followers from attribution |
| `copyright_whitelisted_ig_partners`<br>list<string> | Instagram usernames who will not be reported in copyright match systems |
| `country_page_likes`<br>unsigned int32 | If this is a Page in a Global Pages hierarchy, the number of people who are being directed to this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `cover`<br>[CoverPhoto](https://developers.facebook.com/docs/graph-api/reference/cover-photo/) | Information about the page's cover photo |
| `culinary_team`<br>string | Culinary team of the business. Applicable to Restaurants or Nightlife. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `current_location`<br>string | Current location of the Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). To manage a child Page's location use the [`/{page-id}/locations` endpoint](https://developers.facebook.com/docs/graph-api/reference/page/locations#updatepost). |
| `delivery_and_pickup_option_info`<br>list<string> | A Vector of url strings for delivery\_and\_pickup\_option\_info of the Page. |
| `description`<br>string | The description of the Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). Note that this value is mapped to the **Additional Information** setting in the **Edit Page Info** user interface.<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| `description_html`<br>string | The description of the Page in raw HTML. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `differently_open_offerings`<br>list<KeyValue:enum,bool> | To be used when `temporary_status` is set to `differently_open` to indicate how the business is operating differently than usual, such as a restaurant offering takeout. Enum keys can be one or more of the following: ONLINE\_SERVICES, DELIVERY, PICKUP, OTHER with the value set to `true` or `false`. For example, a business offering food pick up but pausing delivery would be `differently_open_offerings:{"DELIVERY":"false", "PICKUP":"true"}` |
| `directed_by`<br>string | The director of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `display_subtext`<br>string | Subtext about the Page being viewed. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `displayed_message_response_time`<br>string | Page estimated message response time displayed to user. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `does_viewer_have_page_permission_link_ig`<br>bool | does\_viewer\_have\_page\_permission\_link\_ig |
| `emails`<br>list<string> | The emails listed in the About section of a Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `engagement`<br>[Engagement](https://developers.facebook.com/docs/graph-api/reference/engagement/) | The social sentence and like count information for this Page. This is the same info used for the like button |
| `fan_count`<br>unsigned int32 | The number of users who like the Page. For Global Pages this is the count for all Pages across the brand. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). For [New Page Experience](https://developers.facebook.com/docs/pages/reference) Pages, this field will return `followers_count`. |
| `features`<br>string | Features of the vehicle. Applicable to Vehicles. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `followers_count`<br>unsigned int32 | Number of page followers |
| `food_styles`<br>list<string> | The restaurant's food styles. Applicable to Restaurants |
| `founded`<br>string | When the company was founded. Applicable to Pages in the Company category. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `general_info`<br>string | General information provided by the Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `general_manager`<br>string | General manager of the business. Applicable to Restaurants or Nightlife. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `genre`<br>string | The genre of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `global_brand_page_name`<br>string | The name of the Page with country codes appended for Global Pages. Only visible to the Page admin. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `global_brand_root_id`<br>numeric string | This brand's global Root ID |
| `has_added_app`<br>bool | Indicates whether this Page has added the app making the query in a Page tab. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| `has_lead_access`<br>[HasLeadAccess](https://developers.facebook.com/docs/graph-api/reference/has-lead-access/) | has\_lead\_access |
| `has_transitioned_to_new_page_experience`<br>bool | indicates whether a page has transitioned to new page experience or not |
| `has_whatsapp_business_number`<br>bool | Indicates whether WhatsApp number connected to this page is a WhatsApp business number. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `has_whatsapp_number`<br>bool | Indicates whether WhatsApp number connected to this page is a WhatsApp number. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `hometown`<br>string | Hometown of the band. Applicable to Bands |
| `hours`<br>map<string, string> | Indicates a single range of opening hours for a day. Each day can have 2 different `hours` ranges. The keys in the map are in the form of `{day}_{number}_{status}`. `{day}` should be the first 3 characters of the day of the week, `{number}` should be either 1 or 2 to allow for the two different hours ranges per day. `{status}` should be either `open` or `close` to delineate the start or end of a time range. <br>An example with: <br>`{<br>"hours": {<br>    "mon_1_open": "09:00",     //open at 9am on Monday<br>    "mon_1_close": "12:00",    //close at 12pm<br>    "mon_2_open": "13:15",    //open at 1:15pm<br>    "mon_2_close": "18:00".    //close at 6pm<br>}`<br>If one specific day is open 24 hours, the range should be specified as `00:00` to `24:00`. If the place is open 24/7, use the `is_always_open` field instead.<br>**Note:** If a business is open during the night, the closing time can not pass 6:00am. For example, `"mon_2_open":"13:15"` and `"mon_2_close":"5:59"` will work however `"mon_close_close":"6:00"` will not. |
| `impressum`<br>string | Legal information about the Page publishers. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `influences`<br>string | Influences on the band. Applicable to Bands. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `instagram_business_account`<br>[IGUser](https://developers.facebook.com/docs/graph-api/reference/shadow-ig-user/) | Instagram account linked to page during Instagram business conversion flow |
| `is_always_open`<br>bool | Indicates whether this location is always open. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `is_calling_eligible`<br>bool | is\_calling\_eligible |
| `is_chain`<br>bool | Indicates whether location is part of a chain. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `is_community_page`<br>bool | Indicates whether the Page is a community Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `is_eligible_for_branded_content`<br>bool | Indicates whether the page is eligible for the branded content tool |
| `is_eligible_for_disable_connect_ig_btn_for_non_page_admin_am_web`<br>bool | is\_eligible\_for\_disable\_connect\_ig\_btn\_for\_non\_page\_admin\_am\_web |
| `is_messenger_bot_get_started_enabled`<br>bool | Indicates whether the page is a Messenger Platform Bot with Get Started button enabled |
| `is_messenger_platform_bot`<br>bool | Indicates whether the page is a Messenger Platform Bot. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `is_owned`<br>bool | Indicates whether Page is owned. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `is_permanently_closed`<br>bool | Whether the business corresponding to this Page is permanently closed. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `is_published`<br>bool | Indicates whether the Page is published and visible to non-admins |
| `is_unclaimed`<br>bool | Indicates whether the Page is unclaimed |
| `is_verified`<br>bool | Deprecated, use "verification\_status". Pages with a large number of followers can be manually verified by Facebook as \[having an authentic identity\] (https://www.facebook.com/help/196050490547892). This field indicates whether the Page is verified by this process. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access).<br>Deprecated |
| `is_webhooks_subscribed`<br>bool | Indicates whether the application is subscribed for real time updates from this page |
| `keywords`<br>null | Deprecated. Returns null<br>Deprecated |
| `leadgen_tos_acceptance_time`<br>datetime | Indicates the time when the TOS for running LeadGen Ads on the page was accepted |
| `leadgen_tos_accepted`<br>bool | Indicates whether a user has accepted the TOS for running LeadGen Ads on the Page |
| `leadgen_tos_accepting_user`<br>[User](https://developers.facebook.com/docs/graph-api/reference/user/) | Indicates the user who accepted the TOS for running LeadGen Ads on the page |
| `link`<br>string | The Page's Facebook URL<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| `location`<br>[Location](https://developers.facebook.com/docs/graph-api/reference/location/) | The location of this place. Applicable to all Places |
| `members`<br>string | Members of this org. Applicable to Pages representing Team Orgs. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| `merchant_id`<br>string | The instant workflow merchant ID associated with the Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `merchant_review_status`<br>enum | Review status of the Page against FB commerce policies, this status decides whether the Page can use component flow |
| `messaging_feature_status`<br>MessagingFeatureStatus | messaging\_feature\_status |
| `messenger_ads_default_icebreakers`<br>list<string> | The default ice breakers for a certain page |
| `messenger_ads_default_quick_replies`<br>list<string> | The default quick replies for a certain page |
| `messenger_ads_quick_replies_type`<br>enum | Indicates what type this page is and we will generate different sets of quick replies based on it. Values include `UNKNOWN`, `PAGE_SHOP`, or `RETAIL`. |
| `mission`<br>string | The company mission. Applicable to Companies |
| `mpg`<br>string | MPG of the vehicle. Applicable to Vehicles. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `name`<br>string | The name of the Page<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) [Default](https://developers.facebook.com/docs/graph-api/using-graph-api/#fields) |
| `name_with_location_descriptor`<br>string | The name of the Page with its location and/or global brand descriptor. Only visible to a page admin. Non-page admins will get the same value as `name`. |
| `network`<br>string | The TV network for the TV show. Applicable to TV Shows. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `new_like_count`<br>unsigned int32 | The number of people who have liked the Page, since the last login. Only visible to a Page admin. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `offer_eligible`<br>bool | Offer eligibility status. Only visible to a page admin |
| `overall_star_rating`<br>float | Overall page rating based on rating survey from users on a scale of 1-5. This value is normalized and is not guaranteed to be a strict average of user ratings. If there are 0 or a small number of ratings, this field will not be returned. |
| `page_token`<br>string | SELF\_EXPLANATORY |
| `parent_page`<br>[Page](https://developers.facebook.com/docs/graph-api/reference/page/) | Parent Page of this Page. If the Page is part of a Global Root Structure and you have permission to the Global Root, the Global Root Parent Page is returned. If you do not have Global Root permission, the Market Page for your current region is returned as the Parent Page. If your Page is not part of a Global Root Structure, the Parent Page is returned. |
| `parking`<br>[PageParking](https://developers.facebook.com/docs/graph-api/reference/page-parking/) | Parking information. Applicable to Businesses and Places |
| `payment_options`<br>[PagePaymentOptions](https://developers.facebook.com/docs/graph-api/reference/page-payment-options/) | Payment options accepted by the business. Applicable to Restaurants or Nightlife |
| `personal_info`<br>string | Personal information. Applicable to Pages representing People. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| `personal_interests`<br>string | Personal interests. Applicable to Pages representing People. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `pharma_safety_info`<br>string | Pharmacy safety information. Applicable to Pharmaceutical companies. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `phone`<br>string | Phone number provided by a Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| `pickup_options`<br>list<enum> | List of pickup options available at this Page's store location. Values can include `CURBSIDE`, `IN_STORE`, and `OTHER`. |
| `place_type`<br>enum | For places, the category of the place. Value can be `CITY`, `COUNTRY`, `EVENT`, `GEO_ENTITY`, `PLACE`, `RESIDENCE`, `STATE_PROVINCE`, or `TEXT`. |
| `plot_outline`<br>string | The plot outline of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `preferred_audience`<br>Targeting | Group of tags describing the preferred audienceof ads created for the Page |
| `press_contact`<br>string | Press contact information of the band. Applicable to Bands |
| `price_range`<br>string | Price range of the business, such as a restaurant or salon. Values can be one of `$`, `$$`, `$$$`, `$$$$`, `Not Applicable`, or `null` if no value is set.. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `priority_hours`<br>list<KeyValue:string,string> | priority\_hours |
| `privacy_info_url`<br>string | Privacy url in page info section |
| `produced_by`<br>string | The productor of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `products`<br>string | The products of this company. Applicable to Companies |
| `promotion_eligible`<br>bool | Boosted posts eligibility status. Only visible to a page admin |
| `promotion_ineligible_reason`<br>string | Reason for which boosted posts are not eligible. Only visible to a page admin |
| `public_transit`<br>string | Public transit to the business. Applicable to Restaurants or Nightlife. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `rating_count`<br>unsigned int32 | Number of ratings for the Page (limited to ratings that are publicly accessible). Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `recipient`<br>numeric string | Messenger page scope id associated with page and a user using account\_linking\_token |
| `record_label`<br>string | Record label of the band. Applicable to Bands. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `release_date`<br>string | The film's release date. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `restaurant_services`<br>[PageRestaurantServices](https://developers.facebook.com/docs/graph-api/reference/page-restaurant-services/) | Services the restaurant provides. Applicable to Restaurants |
| `restaurant_specialties`<br>[PageRestaurantSpecialties](https://developers.facebook.com/docs/graph-api/reference/page-restaurant-specialties/) | The restaurant's specialties. Applicable to Restaurants |
| `schedule`<br>string | The air schedule of the TV show. Applicable to TV Shows. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `screenplay_by`<br>string | The screenwriter of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `season`<br>string | The season information of the TV Show. Applicable to TV Shows. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `single_line_address`<br>string | The Page address, if any, in a simple single line format. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `starring`<br>string | The cast of the film. Applicable to Films. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `start_info`<br>[PageStartInfo](https://developers.facebook.com/docs/graph-api/reference/page-start-info/) | Information about when the entity represented by the Page was started |
| `store_code`<br>string | Unique store code for this location Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `store_location_descriptor`<br>string | Location Page's store location descriptor |
| `store_number`<br>unsigned int32 | Unique store number for this location Page |
| `studio`<br>string | The studio for the film production. Applicable to Films |
| `supports_donate_button_in_live_video`<br>bool | Whether the user can add a Donate Button to their Live Videos. |
| `talking_about_count`<br>unsigned int32 | The number of people talking about this Page |
| `temporary_status`<br>enum | Indicates how the business corresponding to this Page is operating differently than usual. Possible values:<br>- `differently_open`<br>- `temporarily_closed`<br>- `operating_as_usual`<br>- `no_data`<br>If set to `differently_open` use with `differently_open_offerings` to set status. |
| `unread_message_count`<br>unsigned int32 | Unread message count for the Page. Only visible to a page admin |
| `unread_notif_count`<br>unsigned int32 | Number of unread notifications. Only visible to a page admin |
| `unseen_message_count`<br>unsigned int32 | Unseen message count for the Page. Only visible to a page admin |
| `user_access_expire_time`<br>datetime | user\_access\_expire\_time |
| `username`<br>string | The alias of the Page. For example, for www.facebook.com/platform the username is 'platform'<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| `verification_status`<br>string | Showing whether this [Page is verified](https://www.facebook.com/help/1288173394636262). Value can be `blue_verified` or `gray_verified`, which represents that Facebook has confirmed that a Page is the authentic presence of the public figure, celebrity, or global brand it represents, or `not_verified`. This field can be read with the Page Public Metadata Access feature. |
| `voip_info`<br>[VoipInfo](https://developers.facebook.com/docs/graph-api/reference/voip-info/) | Voip info |
| `website`<br>string | The URL of the Page's website. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `were_here_count`<br>unsigned int32 | The number of visits to this Page's location. If the Page setting _Show map, check-ins and star ratings on the Page_ (under _Page Settings_ \> _Page Info_ \> _Address_) is disabled, then this value will also be disabled. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `whatsapp_number`<br>string | The Page's WhatsApp number. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |
| `written_by`<br>string | The writer of the TV show. Applicable to TV Shows. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS) or [Page Public Metadata Access](https://developers.facebook.com/docs/apps/review/feature#page-public-metadata-access). |

### Edges

| Edge | Description |
| --- | --- |
| [`ab_tests`](https://developers.facebook.com/docs/graph-api/reference/page/ab_tests/)<br>Edge<PagePostExperiment> | ab\_tests |
| [`ads_posts`](https://developers.facebook.com/docs/graph-api/reference/page/ads_posts/)<br>Edge<PagePost> | The ad posts for this Page |
| [`agencies`](https://developers.facebook.com/docs/graph-api/reference/page/agencies/)<br>Edge<Business> | Businesses that have agency permissions on the Page |
| [`albums`](https://developers.facebook.com/docs/graph-api/reference/page/albums/)<br>Edge<Album> | Photo albums for this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`ar_experience`](https://developers.facebook.com/docs/graph-api/reference/page/ar_experience/)<br>Edge<ArAdsDataContainer> | ar\_experience |
| [`assigned_users`](https://developers.facebook.com/docs/graph-api/reference/page/assigned_users/)<br>Edge<AssignedUser> | Users assigned to this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`audio_media_copyrights`](https://developers.facebook.com/docs/graph-api/reference/page/audio_media_copyrights/)<br>Edge<AudioCopyright> | The music copyrights owned by this page (using alacorn) |
| [`blocked`](https://developers.facebook.com/docs/graph-api/reference/page/blocked/)<br>Edge<Profile> | User or Page Profiles blocked from this Page |
| [`businessprojects`](https://developers.facebook.com/docs/graph-api/reference/page/businessprojects/)<br>Edge<BusinessProject> | Business projects |
| [`call_to_actions`](https://developers.facebook.com/docs/graph-api/reference/page/call_to_actions/)<br>Edge<PageCallToAction> | The call-to-action created by this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`canvas_elements`](https://developers.facebook.com/docs/graph-api/reference/page/canvas_elements/)<br>Edge<CanvasBodyElement> | The canvas elements associated with this page |
| [`canvases`](https://developers.facebook.com/docs/graph-api/reference/page/canvases/)<br>Edge<Canvas> | The canvas documents associated with this page |
| [`chat_plugin`](https://developers.facebook.com/docs/graph-api/reference/page/chat_plugin/)<br>Edge<ChatPlugin> | customization configuration values of the Page's corresponding Chat Plugin |
| [`commerce_orders`](https://developers.facebook.com/docs/graph-api/reference/page/commerce_orders/)<br>Edge<CommerceOrder> | The commerce orders of this Page |
| [`conversations`](https://developers.facebook.com/docs/graph-api/reference/page/conversations/)<br>Edge<UnifiedThread> | This Page's conversations |
| [`crosspost_whitelisted_pages`](https://developers.facebook.com/docs/graph-api/reference/page/crosspost_whitelisted_pages/)<br>Edge<Page> | Pages that are allowed to crosspost |
| [`ctx_optimization_eligibility`](https://developers.facebook.com/docs/graph-api/reference/page/ctx_optimization_eligibility/)<br>Edge<CTXOptimizationEligibility> | ctx\_optimization\_eligibility |
| [`custom_labels`](https://developers.facebook.com/docs/graph-api/reference/page/custom_labels/)<br>Edge<PageUserMessageThreadLabel> | custom\_labels |
| [`custom_user_settings`](https://developers.facebook.com/docs/graph-api/reference/page/custom_user_settings/)<br>Edge<CustomUserSettings> | Custom user settings for a page |
| [`fantasy_games`](https://developers.facebook.com/docs/graph-api/reference/page/fantasy_games/)<br>Edge<FantasyGame> | fantasy\_games |
| [`feed`](https://developers.facebook.com/docs/graph-api/reference/page/feed/)<br>Edge<PagePost> | This Page's feed. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`global_brand_children`](https://developers.facebook.com/docs/graph-api/reference/page/global_brand_children/)<br>Edge<Page> | Children Pages of a Global Pages root Page. Both default and root Page can return children Pages. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`image_copyrights`](https://developers.facebook.com/docs/graph-api/reference/page/image_copyrights/)<br>Edge<ImageCopyright> | Image copyrights from this page |
| [`insights`](https://developers.facebook.com/docs/graph-api/reference/page/insights/)<br>Edge<InsightsResult> | This Page's Insights data |
| [`leadgen_forms`](https://developers.facebook.com/docs/graph-api/reference/page/leadgen_forms/)<br>Edge<LeadGenData> | A library of lead generation forms created for this page. |
| [`likes`](https://developers.facebook.com/docs/graph-api/reference/page/likes/)<br>Edge<Page> | The Pages that this Page has liked. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). For [New Page Experience](https://developers.facebook.com/docs/pages/reference) Pages, this field will return `followers_count`.<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| [`live_videos`](https://developers.facebook.com/docs/graph-api/reference/page/live_videos/)<br>Edge<LiveVideo> | Live videos on this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`locations`](https://developers.facebook.com/docs/graph-api/reference/page/locations/)<br>Edge<Page> | The location Pages that are children of this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). To manage a child Page's location use the [`/{page-id}/locations` endpoint](https://developers.facebook.com/docs/graph-api/reference/page/locations#updatepost). |
| [`media_fingerprints`](https://developers.facebook.com/docs/graph-api/reference/page/media_fingerprints/)<br>Edge<MediaFingerprint> | Media fingerprints from this page |
| [`message_templates`](https://developers.facebook.com/docs/graph-api/reference/page/message_templates/)<br>Edge<MessengerBusinessTemplate> | message\_templates |
| [`messaging_feature_review`](https://developers.facebook.com/docs/graph-api/reference/page/messaging_feature_review/)<br>Edge<MessagingFeatureReview> | Feature status of the page that has been granted through feature review that show up in the page settings |
| [`messenger_call_permissions`](https://developers.facebook.com/docs/graph-api/reference/page/messenger_call_permissions/)<br>Edge<MessengerCallPermissions> | messenger\_call\_permissions |
| [`messenger_call_settings`](https://developers.facebook.com/docs/graph-api/reference/page/messenger_call_settings/)<br>Edge<MessengerCallSettings> | messenger\_call\_settings |
| [`messenger_lead_forms`](https://developers.facebook.com/docs/graph-api/reference/page/messenger_lead_forms/)<br>Edge<MessengerAdsPartialAutomatedStepList> | messenger\_lead\_forms |
| [`messenger_profile`](https://developers.facebook.com/docs/graph-api/reference/page/messenger_profile/)<br>Edge<MessengerProfile> | SELF\_EXPLANATORY |
| [`personas`](https://developers.facebook.com/docs/graph-api/reference/page/personas/)<br>Edge<Persona> | Messenger Platform Bot personas for the Page |
| [`photos`](https://developers.facebook.com/docs/graph-api/reference/page/photos/)<br>Edge<Photo> | This Page's Photos. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`picture`](https://developers.facebook.com/docs/graph-api/reference/page/picture/)<br>Edge<ProfilePictureSource> | This Page's profile picture<br>[Core](https://developers.facebook.com/docs/apps/versions/#coreextended) |
| [`posts`](https://developers.facebook.com/docs/graph-api/reference/page/feed/)<br>Edge<PagePost> | This Page's own Posts, a derivative of the `/feed` edge. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`product_catalogs`](https://developers.facebook.com/docs/graph-api/reference/page/product_catalogs/)<br>Edge<ProductCatalog> | Product catalogs owned by this page |
| [`published_posts`](https://developers.facebook.com/docs/graph-api/reference/page/published_posts/)<br>Edge<PagePost> | All published posts by this page |
| [`ratings`](https://developers.facebook.com/docs/graph-api/reference/page/ratings/)<br>Edge<Recommendation> | Open Graph ratings given to this Page |
| [`roles`](https://developers.facebook.com/docs/graph-api/reference/page/roles/)<br>Edge<User> | The Page's Admins |
| [`scheduled_posts`](https://developers.facebook.com/docs/graph-api/reference/page/scheduled_posts/)<br>Edge<PagePost> | All posts that are scheduled to a future date by a page |
| [`secondary_receivers`](https://developers.facebook.com/docs/graph-api/reference/page/secondary_receivers/)<br>Edge<Application> | Secondary Receivers for a page |
| [`settings`](https://developers.facebook.com/docs/graph-api/reference/page/settings/)<br>Edge<PageSettings> | Controllable settings for this page |
| [`shop_setup_status`](https://developers.facebook.com/docs/graph-api/reference/page/shop_setup_status/)<br>Edge<CommerceMerchantSettingsSetupStatus> | Shows the shop setup status |
| [`space_participants`](https://developers.facebook.com/docs/graph-api/reference/page/space_participants/)<br>Edge<Page> | space\_participants |
| [`store_locations`](https://developers.facebook.com/docs/graph-api/reference/page/store_locations/)<br>Edge<StoreLocation> | list of the page's store locations. |
| [`subscribed_apps`](https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps/)<br>Edge<Application> | Applications that have real time update subscriptions for this Page. Note that we will only return information about the current app |
| [`tabs`](https://developers.facebook.com/docs/graph-api/reference/page/tabs/)<br>Edge<Tab> | This Page's tabs and the apps in them. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`tagged`](https://developers.facebook.com/docs/graph-api/reference/page/tagged/)<br>Edge<PagePost> | The Photos, Videos, and Posts in which the Page has been tagged. A derivative of `/feeds`. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`thread_owner`](https://developers.facebook.com/docs/graph-api/reference/page/thread_owner/)<br>Edge<PageThreadOwner> | App which owns a thread for Handover Protocol |
| [`threads`](https://developers.facebook.com/docs/graph-api/reference/thread/)<br>Edge<UnifiedThread> | Deprecated. Use conversations instead |
| [`video_copyright_rules`](https://developers.facebook.com/docs/graph-api/reference/page/video_copyright_rules/)<br>Edge<VideoCopyrightRule> | Video copyright rules from this page |
| [`video_lists`](https://developers.facebook.com/docs/graph-api/reference/page/video_lists/)<br>Edge<VideoList> | Video Playlists for this Page |
| [`videos`](https://developers.facebook.com/docs/graph-api/reference/page/videos/)<br>Edge<Video> | Videos for this Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |
| [`visitor_posts`](https://developers.facebook.com/docs/graph-api/reference/page/visitor_posts/)<br>Edge<PagePost> | Shows all public Posts published by Page visitors on the Page. Can be read with [Page Public Content Access](https://developers.facebook.com/docs/apps/review/feature/#reference-PAGES_ACCESS). |

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 200 | Permissions error |
| 190 | Invalid OAuth 2.0 Access Token |
| 80001 | There have been too many calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 80002 | There have been too many calls to this Instagram account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 102 | Session key invalid or no longer valid |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |
| 80005 | There have been too many leadgen api calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 230 | Permissions disallow message to user |
| 210 | User not visible |

## Creating

This is only available to select developers. Please contact your Facebook Partner for more information.

You can make a POST request to `take_thread_control` edge from the following paths:

- [`/{page_id}/take_thread_control`](https://developers.facebook.com/docs/graph-api/reference/page/take_thread_control/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `metadata`<br>string | Additional information about the conversation |
| `recipient`<br>Object | The PSID for the customer who sent the message to your business<br>Required |
| `id`<br>numeric string |  |
| `follow_id` |  |
| `story_id`<br>story\_id |  |
| `poll_response_id`<br>poll\_response\_id |  |
| `phone_number`<br>string |  |
| `name`<br>Object |  |
| `first_name`<br>string |  |
| `last_name`<br>string |  |
| `user_ref`<br>string |  |
| `comment_id` |  |
| `post_id`<br>string |  |
| `player_id`<br>numeric string |  |
| `one_time_notif_token`<br>string |  |
| `notification_messages_token`<br>string |  |
| `login_id`<br>string |  |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node to which you POSTed.

Struct {

`success`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 551 | This person isn't available right now. |
| 100 | Invalid parameter |
| 190 | Invalid OAuth 2.0 Access Token |
| 200 | Permissions error |

You can make a POST request to `personas` edge from the following paths:

- [`/{page_id}/personas`](https://developers.facebook.com/docs/graph-api/reference/page/personas/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `name`<br>string | Name of a Persona<br>Required |
| `profile_picture_url`<br>URI | Profile picture of a Persona<br>Required |

### Return Type

Struct {

`id`: numeric string,

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 230 | Permissions disallow message to user |

You can make a POST request to `owned_pages` edge from the following paths:

- [`/{business_id}/owned_pages`](https://developers.facebook.com/docs/marketing-api/reference/business/owned_pages/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `entry_point`<br>string | entry point of claiming BusinessClaimAssetEntryPoint |
| `page_id`<br>Page ID | Page ID.<br>Required |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node to which you POSTed.

Struct {

`access_status`: string,

}

### Error Codes

| Error | Description |
| --- | --- |
| 3944 | Your Business Manager already has access to this object. |
| 3977 | To claim a Page in Business Manager, you must already be an Admin of the Page. |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |
| 190 | Invalid OAuth 2.0 Access Token |
| 415 | Two factor authentication required. User have to enter a code from SMS or TOTP code generator to pass 2fac. This could happen when accessing a 2fac-protected asset like a page that is owned by a 2fac-protected business manager. |
| 100 | Invalid parameter |
| 42001 | This Page can't be removed because it's already linked to an Instagram business profile. To remove this Page from Business Manager, go to Instagram and convert to a personal account or change the Page linked to your business profile. |
| 200 | Permissions error |
| 413 | Invalid password |
| 3982 | You do not have sufficient permissions to import this asset into the given Business Manager. |

You can make a POST request to `nlp_configs` edge from the following paths:

- [`/{page_id}/nlp_configs`](https://developers.facebook.com/docs/graph-api/reference/page/nlp_configs/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `api_version`<br>enum {} | api\_version |
| `custom_token`<br>string | An optional Wit token enable custom entities |
| `model`<br>enum {ARABIC, CHINESE, CROATIAN, CUSTOM, DANISH, DUTCH, ENGLISH, FRENCH\_STANDARD, GEORGIAN, GERMAN\_STANDARD, GREEK, HEBREW, HUNGARIAN, IRISH, ITALIAN\_STANDARD, KOREAN, NORWEGIAN\_BOKMAL, POLISH, PORTUGUESE, ROMANIAN, SPANISH, SWEDISH, VIETNAMESE} | An option for which model to use in production. |
| `n_best`<br>int64 | The number of intents and traits to return, other than the best one. |
| `nlp_enabled`<br>boolean | A boolean to enable/disable Built-In NLP. |
| `other_language_support`<br>JSON object {string : JSON object} | A map of language to model type and Wit token for language identification. |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node to which you POSTed.

Struct {

`success`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 80006 | There have been too many messenger api calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 200 | Permissions error |

You can make a POST request to `subscribed_apps` edge from the following paths:

- [`/{page_id}/subscribed_apps`](https://developers.facebook.com/docs/graph-api/reference/page/subscribed_apps/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Example

HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDKcURL [Graph API Explorer](https://developers.facebook.com/tools/explorer/?method=POST&path=%7Bpage-id%7D%2Fsubscribed_apps%3Fsubscribed_fields%3Dleadgen&version=v25.0)

```
POST /v25.0/{page-id}/subscribed_apps HTTP/1.1
Host: graph.facebook.com

subscribed_fields=leadgen
```

```
/* PHP SDK v5.0.0 */
/* make the API call */
try {
  // Returns a `Facebook\FacebookResponse` object
  $response = $fb->post(
    '/{page-id}/subscribed_apps',
    array (
      'subscribed_fields' => 'leadgen',
    ),
    '{access-token}'
  );
} catch(Facebook\Exceptions\FacebookResponseException $e) {
  echo 'Graph returned an error: ' . $e->getMessage();
  exit;
} catch(Facebook\Exceptions\FacebookSDKException $e) {
  echo 'Facebook SDK returned an error: ' . $e->getMessage();
  exit;
}
$graphNode = $response->getGraphNode();
/* handle the result */
```

```
/* make the API call */
FB.api(
    "/{page-id}/subscribed_apps",
    "POST",
    {
        "subscribed_fields": "leadgen"
    },
    function (response) {
      if (response && !response.error) {
        /* handle the result */
      }
    }
);
```

```
Bundle params = new Bundle();
params.putString("subscribed_fields", "leadgen");
/* make the API call */
new GraphRequest(
    AccessToken.getCurrentAccessToken(),
    "/{page-id}/subscribed_apps",
    params,
    HttpMethod.POST,
    new GraphRequest.Callback() {
        public void onCompleted(GraphResponse response) {
            /* handle the result */
        }
    }
).executeAsync();
```

```
NSDictionary *params = @{
  @"subscribed_fields": @"leadgen",
};
/* make the API call */
FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]\
                               initWithGraphPath:@"/{page-id}/subscribed_apps"\
                                      parameters:params\
                                      HTTPMethod:@"POST"];
[request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection,\
                                      id result,\
                                      NSError *error) {\
    // Handle the result\
}];
```

```
curl -X POST \
  -F 'subscribed_fields="leadgen"' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/{page-id}/subscribed_apps
```

If you want to learn how to use the Graph API, read our [Using Graph API guide](https://developers.facebook.com/docs/graph-api/using-graph-api/).

### Parameters

| Parameter | Description |
| --- | --- |
| `subscribed_fields`<br>array<enum {feed, mention, name, picture, category, description, conversations, feature\_access\_list, inbox\_labels, standby, message\_mention, messages, message\_reactions, messaging\_account\_linking, messaging\_checkout\_updates, messaging\_customer\_information, message\_echoes, message\_edits, message\_deliveries, message\_context, messaging\_game\_plays, messaging\_optins, messaging\_optouts, messaging\_payments, messaging\_postbacks, messaging\_pre\_checkouts, message\_reads, messaging\_referrals, messaging\_handovers, messaging\_policy\_enforcement, marketing\_message\_delivery\_failed, marketing\_message\_echoes, marketing\_message\_deliveries, marketing\_message\_clicks, marketing\_message\_reads, messaging\_appointments, messaging\_direct\_sends, messaging\_fblogin\_account\_linking, user\_action, messaging\_feedback, send\_cart, group\_feed, calls, call\_permission\_reply, call\_settings\_update, response\_feedback, messaging\_integrity, business\_integrity, messaging\_in\_thread\_lead\_form\_submit, message\_template\_status\_update, founded, company\_overview, mission, products, general\_info, leadgen, leadgen\_fat, leadgen\_update, location, hours, parking, public\_transit, page\_about\_story, mcom\_invoice\_change, invoice\_access\_invoice\_change, invoice\_access\_invoice\_draft\_change, invoice\_access\_onboarding\_status\_active, invoice\_access\_bank\_slip\_events, local\_delivery, phone, email, website, ratings, attire, payment\_options, culinary\_team, general\_manager, price\_range, awards, hometown, current\_location, bio, affiliation, birthday, personal\_info, personal\_interests, members, checkins, page\_upcoming\_change, page\_change\_proposal, merchant\_review, product\_review, videos, live\_videos, video\_text\_question\_responses, registration, payment\_request\_update, publisher\_subscriptions, invalid\_topic\_placeholder, marketing\_messages\_subscriber\_upload\_status, follow, story\_share, comment\_poll\_response, story\_poll\_response}> | Page Webhooks fields that you want to subscribe<br>Required |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node to which you POSTed.

Struct {

`success`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 200 | Permissions error |
| 190 | Invalid OAuth 2.0 Access Token |
| 100 | Invalid parameter |
| 104 | Incorrect signature |
| 210 | User not visible |
| 80001 | There have been too many calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 102 | Session key invalid or no longer valid |

You can make a POST request to `feed` edge from the following paths:

- [`/{page_id}/feed`](https://developers.facebook.com/docs/graph-api/reference/page/feed/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Example

HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDKcURL [Graph API Explorer](https://developers.facebook.com/tools/explorer/?method=POST&path=%7Bpage-id%7D%2Ffeed%3Fmessage%3DThis%2Bis%2Ba%2Btest%2Bvalue&version=v25.0)

```
POST /v25.0/{page-id}/feed HTTP/1.1
Host: graph.facebook.com

message=This+is+a+test+value
```

```
/* PHP SDK v5.0.0 */
/* make the API call */
try {
  // Returns a `Facebook\FacebookResponse` object
  $response = $fb->post(
    '/{page-id}/feed',
    array (
      'message' => 'This is a test value',
    ),
    '{access-token}'
  );
} catch(Facebook\Exceptions\FacebookResponseException $e) {
  echo 'Graph returned an error: ' . $e->getMessage();
  exit;
} catch(Facebook\Exceptions\FacebookSDKException $e) {
  echo 'Facebook SDK returned an error: ' . $e->getMessage();
  exit;
}
$graphNode = $response->getGraphNode();
/* handle the result */
```

```
/* make the API call */
FB.api(
    "/{page-id}/feed",
    "POST",
    {
        "message": "This is a test value"
    },
    function (response) {
      if (response && !response.error) {
        /* handle the result */
      }
    }
);
```

```
Bundle params = new Bundle();
params.putString("message", "This is a test value");
/* make the API call */
new GraphRequest(
    AccessToken.getCurrentAccessToken(),
    "/{page-id}/feed",
    params,
    HttpMethod.POST,
    new GraphRequest.Callback() {
        public void onCompleted(GraphResponse response) {
            /* handle the result */
        }
    }
).executeAsync();
```

```
NSDictionary *params = @{
  @"message": @"This is a test value",
};
/* make the API call */
FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]\
                               initWithGraphPath:@"/{page-id}/feed"\
                                      parameters:params\
                                      HTTPMethod:@"POST"];
[request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection,\
                                      id result,\
                                      NSError *error) {\
    // Handle the result\
}];
```

```
curl -X POST \
  -F 'message="This is a test value"' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/{page-id}/feed
```

If you want to learn how to use the Graph API, read our [Using Graph API guide](https://developers.facebook.com/docs/graph-api/using-graph-api/).

### Parameters

| Parameter | Description |
| --- | --- |
| `actions` | SELF\_EXPLANATORY |
| `album_id`<br>numeric string | SELF\_EXPLANATORY |
| `android_key_hash`<br>string | SELF\_EXPLANATORY |
| `application_id`<br>non-empty string | SELF\_EXPLANATORY |
| `asked_fun_fact_prompt_id`<br>int64 | asked\_fun\_fact\_prompt\_id |
| `asset3d_id`<br>numeric string or integer | asset3d\_id |
| `associated_id`<br>numeric string or integer | SELF\_EXPLANATORY |
| `attach_place_suggestion`<br>boolean | Default value: `false`<br>SELF\_EXPLANATORY |
| `attached_media`<br>list<Object> | SELF\_EXPLANATORY |
| `media_fbid`<br>numeric string |  |
| `message`<br>UTF-8 string | Supports Emoji |
| `audience_exp`<br>boolean | Default value: `false`<br>SELF\_EXPLANATORY |
| `backdated_time`<br>datetime | SELF\_EXPLANATORY |
| `backdated_time_granularity`<br>enum{year, month, day, hour, min, none} | Default value: `none`<br>SELF\_EXPLANATORY |
| `breaking_news`<br>boolean | breaking\_news |
| `breaking_news_expiration`<br>int64 | breaking\_news\_expiration |
| `call_to_action`<br>Object | SELF\_EXPLANATORY<br>Supports Emoji |
| `type`<br>enum{BOOK\_TRAVEL, CONTACT\_US, DONATE, DONATE\_NOW, DOWNLOAD, GET\_DIRECTIONS, GO\_LIVE, INTERESTED, LEARN\_MORE, SEE\_DETAILS, LIKE\_PAGE, MESSAGE\_PAGE, RAISE\_MONEY, SAVE, SEND\_TIP, SHOP\_NOW, SIGN\_UP, VIEW\_INSTAGRAM\_PROFILE, INSTAGRAM\_MESSAGE, LOYALTY\_LEARN\_MORE, PURCHASE\_GIFT\_CARDS, PAY\_TO\_ACCESS, SEE\_MORE, TRY\_IN\_CAMERA, WHATSAPP\_LINK, GET\_IN\_TOUCH, TRY\_NOW, ASK\_A\_QUESTION, START\_A\_CHAT, CHAT\_NOW, ASK\_US, CHAT\_WITH\_US, BOOK\_NOW, CHECK\_AVAILABILITY, ORDER\_NOW, WHATSAPP\_MESSAGE, GET\_MOBILE\_APP, INSTALL\_MOBILE\_APP, USE\_MOBILE\_APP, INSTALL\_APP, USE\_APP, PLAY\_GAME, TRY\_DEMO, WATCH\_VIDEO, WATCH\_MORE, OPEN\_LINK, NO\_BUTTON, LISTEN\_MUSIC, MOBILE\_DOWNLOAD, GET\_OFFER, GET\_OFFER\_VIEW, BUY\_NOW, BUY\_TICKETS, UPDATE\_APP, BET\_NOW, ADD\_TO\_CART, SELL\_NOW, GET\_SHOWTIMES, LISTEN\_NOW, GET\_EVENT\_TICKETS, REMIND\_ME, SEARCH\_MORE, PRE\_REGISTER, SWIPE\_UP\_PRODUCT, SWIPE\_UP\_SHOP, PLAY\_GAME\_ON\_FACEBOOK, VISIT\_WORLD, OPEN\_INSTANT\_APP, JOIN\_GROUP, GET\_PROMOTIONS, SEND\_UPDATES, INQUIRE\_NOW, VISIT\_PROFILE, CHAT\_ON\_WHATSAPP, EXPLORE\_MORE, CONFIRM, JOIN\_CHANNEL, MAKE\_AN\_APPOINTMENT, ASK\_ABOUT\_SERVICES, BOOK\_A\_CONSULTATION, GET\_A\_QUOTE, BUY\_VIA\_MESSAGE, ASK\_FOR\_MORE\_INFO, VIEW\_PRODUCT, VIEW\_CHANNEL, WATCH\_LIVE\_VIDEO, IMAGINE, CALL, MISSED\_CALL, CALL\_NOW, CALL\_ME, APPLY\_NOW, BUY, GET\_QUOTE, SUBSCRIBE, RECORD\_NOW, VOTE\_NOW, GIVE\_FREE\_RIDES, REGISTER\_NOW, OPEN\_MESSENGER\_EXT, EVENT\_RSVP, CIVIC\_ACTION, SEND\_INVITES, REFER\_FRIENDS, REQUEST\_TIME, SEE\_MENU, SEARCH, TRY\_IT, TRY\_ON, LINK\_CARD, DIAL\_CODE, FIND\_YOUR\_GROUPS, START\_ORDER} | The type of the action. Not all types can be used for all<br>ads. Check<br>[Ads Product Guide](https://www.facebook.com/business/ads-guide)<br>to see which type can be used for based on the `objective` of your<br>campaign.<br>Required |
| `value`<br>Object | Default value: `Vec`<br>JSON containing the call to action data.<br>Supports Emoji |
| `android_url`<br>string |  |
| `ios_url`<br>string |  |
| `link`<br>URL |  |
| `app_link`<br>string |  |
| `page`<br>numeric string or integer |  |
| `link_format`<br>enum {VIDEO\_LEAD, VIDEO\_LPP, VIDEO\_NEKO, VIDEO\_NON\_LINK, VIDEO\_SHOP, WHATSAPP\_CATALOG\_ATTACHMENT} |  |
| `application`<br>numeric string or integer |  |
| `link_title`<br>string | Supports Emoji |
| `link_description`<br>string | Supports Emoji |
| `link_caption`<br>string |  |
| `product_link`<br>string |  |
| `get_movie_showtimes`<br>boolean |  |
| `sponsorship`<br>Object |  |
| `link`<br>URL |  |
| `image`<br>URL |  |
| `video_annotation`<br>Object |  |
| `annotations`<br>list<Object> |  |
| `start_time_in_sec`<br>int64 |  |
| `end_time_in_sec`<br>int64 |  |
| `link`<br>URL |  |
| `link_title`<br>string |  |
| `link_description`<br>string |  |
| `link_caption`<br>string |  |
| `image_url`<br>URL |  |
| `header_color`<br>string |  |
| `logo_url`<br>URL |  |
| `post_click_cta_title`<br>string |  |
| `post_click_description_title`<br>string |  |
| `offer_id`<br>numeric string or integer |  |
| `offer_view_id`<br>numeric string or integer |  |
| `advanced_data`<br>Object |  |
| `offer_id`<br>numeric string or integer |  |
| `lead_gen_form_id`<br>numeric string or integer |  |
| `referral_id`<br>numeric string or integer |  |
| `search_dialog_id`<br>numeric string or integer |  |
| `fundraiser_campaign_id`<br>numeric string or integer |  |
| `event_id`<br>numeric string or integer |  |
| `event_tour_id`<br>numeric string or integer |  |
| `app_destination`<br>enum {MESSENGER, MESSENGER\_EXTENSIONS, MESSENGER\_GAMES, LINK\_CARD, MARKETPLACE, WHATSAPP, INSTAGRAM\_DIRECT, INSTAGRAM\_LIVE\_VIDEO, FACEBOOK\_LIVE\_VIDEO} |  |
| `app_destination_page_id`<br>numeric string or integer |  |
| `is_canvas_video_transition_enabled`<br>boolean |  |
| `whatsapp_number`<br>string |  |
| `preinput_text`<br>string |  |
| `customized_message_page_cta_text`<br>string |  |
| `external_offer_provider_id`<br>numeric string or integer |  |
| `origins`<br>enum {COMPOSER, CAMERA} |  |
| `object_store_urls`<br>array<string> |  |
| `facebook_login_spec`<br>Object |  |
| `facebook_login_app_id`<br>numeric string or integer |  |
| `offer_type`<br>enum {NO\_OFFER, PERCENTAGE\_BASED, AMOUNT\_BASED} |  |
| `offer_pct_call_to_action`<br>enum {TEN} |  |
| `offer_amt_call_to_action`<br>enum {TEN} |  |
| `product_id`<br>numeric string or integer |  |
| `group_id`<br>numeric string or integer |  |
| `channel_id`<br>string |  |
| `land_on_whatsapp_catalog`<br>enum{1, 2} |  |
| `land_on_whatsapp_profile`<br>string |  |
| `caption`<br>string | SELF\_EXPLANATORY<br>Supports Emoji |
| `child_attachments`<br>list<Object> | SELF\_EXPLANATORY<br>Supports Emoji |
| `picture`<br>URL |  |
| `name`<br>string | Supports Emoji |
| `link`<br>URL | Required |
| `caption`<br>string | Supports Emoji |
| `description`<br>string | Supports Emoji |
| `quote`<br>UTF-8 string | Supports Emoji |
| `source`<br>URL |  |
| `properties` |  |
| `object_attachment`<br>numeric string or integer |  |
| `height`<br>int64 |  |
| `width`<br>int64 |  |
| `expanded_height`<br>int64 |  |
| `expanded_width`<br>int64 |  |
| `referral_id`<br>numeric string or integer |  |
| `thumbnail`<br>file |  |
| `image_crops`<br>dictionary { enum{191x100, 100x72, 400x150, 600x360, 100x100, 400x500, 90x160, 300x400} : <list<list<int64>>> } |  |
| `call_to_action`<br>Object | Supports Emoji |
| `type`<br>enum{BOOK\_TRAVEL, CONTACT\_US, DONATE, DONATE\_NOW, DOWNLOAD, GET\_DIRECTIONS, GO\_LIVE, INTERESTED, LEARN\_MORE, SEE\_DETAILS, LIKE\_PAGE, MESSAGE\_PAGE, RAISE\_MONEY, SAVE, SEND\_TIP, SHOP\_NOW, SIGN\_UP, VIEW\_INSTAGRAM\_PROFILE, INSTAGRAM\_MESSAGE, LOYALTY\_LEARN\_MORE, PURCHASE\_GIFT\_CARDS, PAY\_TO\_ACCESS, SEE\_MORE, TRY\_IN\_CAMERA, WHATSAPP\_LINK, GET\_IN\_TOUCH, TRY\_NOW, ASK\_A\_QUESTION, START\_A\_CHAT, CHAT\_NOW, ASK\_US, CHAT\_WITH\_US, BOOK\_NOW, CHECK\_AVAILABILITY, ORDER\_NOW, WHATSAPP\_MESSAGE, GET\_MOBILE\_APP, INSTALL\_MOBILE\_APP, USE\_MOBILE\_APP, INSTALL\_APP, USE\_APP, PLAY\_GAME, TRY\_DEMO, WATCH\_VIDEO, WATCH\_MORE, OPEN\_LINK, NO\_BUTTON, LISTEN\_MUSIC, MOBILE\_DOWNLOAD, GET\_OFFER, GET\_OFFER\_VIEW, BUY\_NOW, BUY\_TICKETS, UPDATE\_APP, BET\_NOW, ADD\_TO\_CART, SELL\_NOW, GET\_SHOWTIMES, LISTEN\_NOW, GET\_EVENT\_TICKETS, REMIND\_ME, SEARCH\_MORE, PRE\_REGISTER, SWIPE\_UP\_PRODUCT, SWIPE\_UP\_SHOP, PLAY\_GAME\_ON\_FACEBOOK, VISIT\_WORLD, OPEN\_INSTANT\_APP, JOIN\_GROUP, GET\_PROMOTIONS, SEND\_UPDATES, INQUIRE\_NOW, VISIT\_PROFILE, CHAT\_ON\_WHATSAPP, EXPLORE\_MORE, CONFIRM, JOIN\_CHANNEL, MAKE\_AN\_APPOINTMENT, ASK\_ABOUT\_SERVICES, BOOK\_A\_CONSULTATION, GET\_A\_QUOTE, BUY\_VIA\_MESSAGE, ASK\_FOR\_MORE\_INFO, VIEW\_PRODUCT, VIEW\_CHANNEL, WATCH\_LIVE\_VIDEO, IMAGINE, CALL, MISSED\_CALL, CALL\_NOW, CALL\_ME, APPLY\_NOW, BUY, GET\_QUOTE, SUBSCRIBE, RECORD\_NOW, VOTE\_NOW, GIVE\_FREE\_RIDES, REGISTER\_NOW, OPEN\_MESSENGER\_EXT, EVENT\_RSVP, CIVIC\_ACTION, SEND\_INVITES, REFER\_FRIENDS, REQUEST\_TIME, SEE\_MENU, SEARCH, TRY\_IT, TRY\_ON, LINK\_CARD, DIAL\_CODE, FIND\_YOUR\_GROUPS, START\_ORDER} | The type of the action. Not all types can be used for all<br>ads. Check<br>[Ads Product Guide](https://www.facebook.com/business/ads-guide)<br>to see which type can be used for based on the `objective` of your<br>campaign.<br>Required |
| `value`<br>Object | Default value: `Vec`<br>JSON containing the call to action data.<br>Supports Emoji |
| `android_url`<br>string |  |
| `ios_url`<br>string |  |
| `link`<br>URL |  |
| `app_link`<br>string |  |
| `page`<br>numeric string or integer |  |
| `link_format`<br>enum {VIDEO\_LEAD, VIDEO\_LPP, VIDEO\_NEKO, VIDEO\_NON\_LINK, VIDEO\_SHOP, WHATSAPP\_CATALOG\_ATTACHMENT} |  |
| `application`<br>numeric string or integer |  |
| `link_title`<br>string | Supports Emoji |
| `link_description`<br>string | Supports Emoji |
| `link_caption`<br>string |  |
| `product_link`<br>string |  |
| `get_movie_showtimes`<br>boolean |  |
| `sponsorship`<br>Object |  |
| `link`<br>URL |  |
| `image`<br>URL |  |
| `video_annotation`<br>Object |  |
| `annotations`<br>list<Object> |  |
| `start_time_in_sec`<br>int64 |  |
| `end_time_in_sec`<br>int64 |  |
| `link`<br>URL |  |
| `link_title`<br>string |  |
| `link_description`<br>string |  |
| `link_caption`<br>string |  |
| `image_url`<br>URL |  |
| `header_color`<br>string |  |
| `logo_url`<br>URL |  |
| `post_click_cta_title`<br>string |  |
| `post_click_description_title`<br>string |  |
| `offer_id`<br>numeric string or integer |  |
| `offer_view_id`<br>numeric string or integer |  |
| `advanced_data`<br>Object |  |
| `offer_id`<br>numeric string or integer |  |
| `lead_gen_form_id`<br>numeric string or integer |  |
| `referral_id`<br>numeric string or integer |  |
| `search_dialog_id`<br>numeric string or integer |  |
| `fundraiser_campaign_id`<br>numeric string or integer |  |
| `event_id`<br>numeric string or integer |  |
| `event_tour_id`<br>numeric string or integer |  |
| `app_destination`<br>enum {MESSENGER, MESSENGER\_EXTENSIONS, MESSENGER\_GAMES, LINK\_CARD, MARKETPLACE, WHATSAPP, INSTAGRAM\_DIRECT, INSTAGRAM\_LIVE\_VIDEO, FACEBOOK\_LIVE\_VIDEO} |  |
| `app_destination_page_id`<br>numeric string or integer |  |
| `is_canvas_video_transition_enabled`<br>boolean |  |
| `whatsapp_number`<br>string |  |
| `preinput_text`<br>string |  |
| `customized_message_page_cta_text`<br>string |  |
| `external_offer_provider_id`<br>numeric string or integer |  |
| `origins`<br>enum {COMPOSER, CAMERA} |  |
| `object_store_urls`<br>array<string> |  |
| `facebook_login_spec`<br>Object |  |
| `facebook_login_app_id`<br>numeric string or integer |  |
| `offer_type`<br>enum {NO\_OFFER, PERCENTAGE\_BASED, AMOUNT\_BASED} |  |
| `offer_pct_call_to_action`<br>enum {TEN} |  |
| `offer_amt_call_to_action`<br>enum {TEN} |  |
| `product_id`<br>numeric string or integer |  |
| `group_id`<br>numeric string or integer |  |
| `channel_id`<br>string |  |
| `land_on_whatsapp_catalog`<br>enum{1, 2} |  |
| `land_on_whatsapp_profile`<br>string |  |
| `image_hash`<br>string |  |
| `static_card`<br>boolean |  |
| `place_data`<br>Object |  |
| `address_string`<br>string |  |
| `label`<br>string |  |
| `latitude` |  |
| `location_source_id`<br>numeric string |  |
| `longitude` |  |
| `type`<br>enum {DYNAMIC, REALTIME, SINGLE} | Required |
| `video_id`<br>numeric string or integer |  |
| `caption_ids`<br>list<numeric string or integer> |  |
| `offer_id`<br>numeric string or integer |  |
| `marketing_message_buttons`<br>array<JSON object> |  |
| `custom_field_for_url_suffix`<br>string | custom\_field\_for\_url\_suffix |
| `is_derived_from_cta`<br>boolean | is\_derived\_from\_cta |
| `android_app_metadata`<br>JSON object | android\_app\_metadata |
| `deep_link_url`<br>string | deep\_link\_url |
| `type`<br>enum {DEEPLINK\_WITH\_WEB\_FALLBACK, DEEPLINK\_WITH\_APPSTORE\_FALLBACK, WEB\_ONLY} | type<br>Required |
| `app_store_url`<br>string | app\_store\_url |
| `ios_app_metadata`<br>JSON object | ios\_app\_metadata |
| `deep_link_url`<br>string | deep\_link\_url |
| `type`<br>enum {DEEPLINK\_WITH\_WEB\_FALLBACK, DEEPLINK\_WITH\_APPSTORE\_FALLBACK, WEB\_ONLY} | type<br>Required |
| `app_store_url`<br>string | app\_store\_url |
| `app_id`<br>numeric string | app\_id |
| `preconfigured_response_image_hash`<br>string | preconfigured\_response\_image\_hash |
| `preconfigured_response_video_id`<br>numeric string | preconfigured\_response\_video\_id |
| `preconfigured_response_video_thumbnail_url`<br>string | preconfigured\_response\_video\_thumbnail\_url |
| `preconfigured_response_button`<br>JSON object | preconfigured\_response\_button |
| `url`<br>string | url |
| `type`<br>enum {APP, COPY\_CODE, PHONE\_NUMBER, QUICK\_REPLY, URL} | type<br>Required |
| `text`<br>string | text<br>Required |
| `cta_type`<br>enum {OPEN\_LINK, LIKE\_PAGE, SHOP\_NOW, PLAY\_GAME, INSTALL\_APP, USE\_APP, CALL, CALL\_ME, VIDEO\_CALL, INSTALL\_MOBILE\_APP, USE\_MOBILE\_APP, MOBILE\_DOWNLOAD, BOOK\_TRAVEL, LISTEN\_MUSIC, WATCH\_VIDEO, LEARN\_MORE, SIGN\_UP, DOWNLOAD, WATCH\_MORE, NO\_BUTTON, VISIT\_PAGES\_FEED, CALL\_NOW, APPLY\_NOW, CONTACT, BUY\_NOW, GET\_OFFER, GET\_OFFER\_VIEW, BUY\_TICKETS, UPDATE\_APP, GET\_DIRECTIONS, BUY, SEND\_UPDATES, MESSAGE\_PAGE, DONATE, SUBSCRIBE, SAY\_THANKS, SELL\_NOW, SHARE, DONATE\_NOW, GET\_QUOTE, CONTACT\_US, ORDER\_NOW, START\_ORDER, ADD\_TO\_CART, VIEW\_CART, VIEW\_IN\_CART, VIDEO\_ANNOTATION, RECORD\_NOW, INQUIRE\_NOW, CONFIRM, REFER\_FRIENDS, REQUEST\_TIME, GET\_SHOWTIMES, LISTEN\_NOW, TRY\_DEMO, WOODHENGE\_SUPPORT, SOTTO\_SUBSCRIBE, FOLLOW\_USER, RAISE\_MONEY, SEE\_SHOP, GET\_DETAILS, FIND\_OUT\_MORE, VISIT\_WEBSITE, BROWSE\_SHOP, EVENT\_RSVP, WHATSAPP\_MESSAGE, FOLLOW\_NEWS\_STORYLINE, SEE\_MORE, BOOK\_NOW, FIND\_A\_GROUP, FIND\_YOUR\_GROUPS, PAY\_TO\_ACCESS, PURCHASE\_GIFT\_CARDS, FOLLOW\_PAGE, SEND\_A\_GIFT, SWIPE\_UP\_SHOP, SWIPE\_UP\_PRODUCT, SEND\_GIFT\_MONEY, PLAY\_GAME\_ON\_FACEBOOK, GET\_STARTED, OPEN\_INSTANT\_APP, AUDIO\_CALL, GET\_PROMOTIONS, JOIN\_CHANNEL, MAKE\_AN\_APPOINTMENT, ASK\_ABOUT\_SERVICES, BOOK\_A\_CONSULTATION, GET\_A\_QUOTE, BUY\_VIA\_MESSAGE, ASK\_FOR\_MORE\_INFO, CHAT\_WITH\_US, VIEW\_PRODUCT, VIEW\_CHANNEL, GET\_IN\_TOUCH, ASK\_A\_QUESTION, START\_A\_CHAT, CHAT\_NOW, ASK\_US, WATCH\_LIVE\_VIDEO, SHOP\_WITH\_AI, TRY\_ON\_WITH\_AI} | cta\_type |
| `client_mutation_id`<br>string | SELF\_EXPLANATORY |
| `composer_entry_picker`<br>string | composer\_entry\_picker |
| `composer_entry_point`<br>string | composer\_entry\_point |
| `composer_entry_time`<br>int64 | composer\_entry\_time |
| `composer_session_events_log`<br>JSON-encoded string | composer\_session\_events\_log |
| `composer_session_id`<br>string | SELF\_EXPLANATORY |
| `composer_source_surface`<br>string | composer\_source\_surface |
| `composer_type`<br>string | composer\_type |
| `connection_class`<br>string | SELF\_EXPLANATORY |
| `content_attachment`<br>numeric string | content\_attachment |
| `coordinates`<br>JSON-encoded coordinate list | SELF\_EXPLANATORY |
| `cta_link`<br>string | cta\_link |
| `cta_type`<br>string | cta\_type |
| `description`<br>string | SELF\_EXPLANATORY<br>Supports Emoji |
| `direct_share_status`<br>int64 | direct\_share\_status |
| `enforce_link_ownership`<br>boolean | Default value: `false`<br>SELF\_EXPLANATORY |
| `expanded_height`<br>int64 | SELF\_EXPLANATORY |
| `expanded_width`<br>int64 | SELF\_EXPLANATORY |
| `feed_targeting`<br>feed target | SELF\_EXPLANATORY |
| `geo_locations`<br>Object |  |
| `countries`<br>list<string> |  |
| `regions`<br>list<Object> |  |
| `key`<br>int64 |  |
| `cities`<br>list<Object> |  |
| `key`<br>int64 |  |
| `zips`<br>list<Object> |  |
| `key`<br>string |  |
| `locales`<br>list<string> | Values for targeted locales. Use `type` of `adlocale` to [find Targeting Options](https://developers.facebook.com/docs/marketing-api/targeting-search) and use the returned key to specify. |
| `age_min`<br>int64 | Must be `13` or higher. Default is 0. |
| `age_max`<br>int64 | Maximum age. |
| `genders`<br>list<int64> | Target specific genders. `1` targets all male viewers and `2` females. Default is to target both. |
| `college_years`<br>list<int64> | Array of integers. Represent graduation years from college. |
| `education_statuses`<br>list<int64> | Array of integers which represent current educational status. Use `1` for high school, `2` for undergraduate, and `3` for alum (or localized equivalents). |
| `interested_in`<br>list<int64> | Deprecated. Please see the [Graph API Changelog](https://developers.facebook.com/docs/graph-api/changelog/breaking-changes#2-7-2018) for more information.<br>Deprecated |
| `relationship_statuses`<br>list<int64> | Array of integers for targeting based on relationship status. Use `1` for single, `2` for 'in a relationship', `3` for married, and `4` for engaged. Default is all types. |
| `interests`<br>list<int64> | One or more IDs of pages to target fans of pages.Use `type` of `page` to get possible IDs as [find Targeting Options](https://developers.facebook.com/docs/marketing-api/targeting-search) and use the returned id to specify. |
| `formatting`<br>enum {PLAINTEXT, MARKDOWN} | formatting |
| `fun_fact_prompt_id`<br>numeric string or integer | fun\_fact\_prompt\_id |
| `fun_fact_toastee_id`<br>int64 | fun\_fact\_toastee\_id |
| `height`<br>int64 | SELF\_EXPLANATORY |
| `home_checkin_city_id`<br>place tag | SELF\_EXPLANATORY |
| `image_crops`<br>dictionary { enum{191x100, 100x72, 400x150, 600x360, 100x100, 400x500, 90x160, 300x400} : <list<list<int64>>> } | SELF\_EXPLANATORY |
| `implicit_with_tags`<br>list<int> | SELF\_EXPLANATORY |
| `instant_game_entry_point_data`<br>string | instant\_game\_entry\_point\_data |
| `ios_bundle_id`<br>string | SELF\_EXPLANATORY |
| `is_backout_draft`<br>boolean | is\_backout\_draft |
| `is_boost_intended`<br>boolean | is\_boost\_intended |
| `is_explicit_location`<br>boolean | SELF\_EXPLANATORY |
| `is_explicit_share`<br>boolean | SELF\_EXPLANATORY |
| `is_group_linking_post`<br>boolean | is\_group\_linking\_post |
| `is_photo_container`<br>boolean | SELF\_EXPLANATORY |
| `link`<br>URL | SELF\_EXPLANATORY |
| `location_source_id`<br>numeric string or integer | location\_source\_id |
| `manual_privacy`<br>boolean | Default value: `false`<br>SELF\_EXPLANATORY |
| `message`<br>UTF-8 string | SELF\_EXPLANATORY<br>Supports Emoji |
| `multi_share_end_card`<br>boolean | Default value: `true`<br>SELF\_EXPLANATORY |
| `multi_share_optimized`<br>boolean | Default value: `true`<br>SELF\_EXPLANATORY |
| `name`<br>string | SELF\_EXPLANATORY<br>Supports Emoji |
| `nectar_module`<br>string | SELF\_EXPLANATORY |
| `object_attachment`<br>numeric string or integer | SELF\_EXPLANATORY |
| `og_action_type_id`<br>numeric string or integer | SELF\_EXPLANATORY |
| `og_hide_object_attachment`<br>boolean | SELF\_EXPLANATORY |
| `og_icon_id`<br>numeric string or integer | SELF\_EXPLANATORY |
| `og_object_id`<br>OG object ID or URL string | SELF\_EXPLANATORY |
| `og_phrase`<br>UTF-8 string | SELF\_EXPLANATORY<br>Supports Emoji |
| `og_set_profile_badge`<br>boolean | Default value: `false`<br>og\_set\_profile\_badge |
| `og_suggestion_mechanism`<br>string | SELF\_EXPLANATORY |
| `page_recommendation`<br>JSON-encoded string | page\_recommendation |
| `picture`<br>URL | SELF\_EXPLANATORY |
| `place`<br>place tag | SELF\_EXPLANATORY |
| `place_attachment_setting`<br>enum {1, 2} | Default value: `2`<br>place\_attachment\_setting |
| `place_list`<br>JSON-encoded string | place\_list |
| `place_list_data`<br>array | place\_list\_data |
| `post_surfaces_blacklist`<br>list<enum {1, 2, 3, 4, 5}> | post\_surfaces\_blacklist |
| `posting_to_redspace`<br>enum {enabled, disabled} | Default value: `disabled`<br>posting\_to\_redspace |
| `privacy`<br>Privacy Parameter | SELF\_EXPLANATORY |
| `prompt_id`<br>string | prompt\_id |
| `prompt_tracking_string`<br>string | prompt\_tracking\_string |
| `properties` | SELF\_EXPLANATORY |
| `proxied_app_id`<br>numeric string or integer | SELF\_EXPLANATORY |
| `publish_event_id`<br>int64 | publish\_event\_id |
| `published`<br>boolean | Default value: `true`<br>SELF\_EXPLANATORY |
| `quote`<br>UTF-8 string | quote<br>Supports Emoji |
| `ref`<br>list<string> | Default value: `Default`<br>SELF\_EXPLANATORY |
| `referenceable_image_ids`<br>list<numeric string or integer> | referenceable\_image\_ids |
| `referral_id`<br>numeric string or integer | referral\_id |
| `scheduled_publish_time`<br>datetime | SELF\_EXPLANATORY |
| `source`<br>URL | SELF\_EXPLANATORY |
| `sponsor_id`<br>numeric string or integer | sponsor\_id |
| `sponsor_relationship`<br>int64 | sponsor\_relationship |
| `suggested_place_id`<br>place tag | SELF\_EXPLANATORY |
| `tags`<br>list<int> | SELF\_EXPLANATORY |
| `target_surface`<br>enum {STORY, TIMELINE} | Default value: `"TIMELINE"`<br>target\_surface |
| `targeting`<br>target | SELF\_EXPLANATORY |
| `geo_locations`<br>Object |  |
| `countries`<br>list<string> |  |
| `regions`<br>list<Object> |  |
| `key`<br>int64 |  |
| `cities`<br>list<Object> |  |
| `key`<br>int64 |  |
| `zips`<br>list<Object> |  |
| `key`<br>string |  |
| `locales`<br>list<string> |  |
| `excluded_countries`<br>list<string> |  |
| `excluded_regions`<br>list<int64> |  |
| `excluded_cities`<br>list<int64> |  |
| `excluded_zipcodes`<br>list<string> |  |
| `timezones`<br>list<int64> |  |
| `age_min`<br>enum {13, 15, 18, 21, 25} |  |
| `text_format_metadata`<br>JSON-encoded string | text\_format\_metadata |
| `text_format_preset_id`<br>numeric string or integer | text\_format\_preset\_id |
| `text_only_place`<br>string | SELF\_EXPLANATORY |
| `thumbnail`<br>file | SELF\_EXPLANATORY |
| `time_since_original_post`<br>int64 | SELF\_EXPLANATORY |
| `title`<br>UTF-8 string | SELF\_EXPLANATORY<br>Supports Emoji |
| `tracking_info`<br>JSON-encoded string | tracking\_info |
| `unpublished_content_type`<br>enum {SCHEDULED, SCHEDULED\_RECURRING, DRAFT, PUBLISH\_PENDING, ADS\_POST, INLINE\_CREATED, PUBLISHED, REVIEWABLE\_BRANDED\_CONTENT} | SELF\_EXPLANATORY |
| `user_selected_tags`<br>boolean | Default value: `false`<br>SELF\_EXPLANATORY |
| `video_start_time_ms`<br>int64 | video\_start\_time\_ms |
| `viewer_coordinates`<br>JSON-encoded coordinate list | SELF\_EXPLANATORY |
| `width`<br>int64 | SELF\_EXPLANATORY |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node represented by `id` in the return type.

Struct {

`id`: token with structure: Post ID,

`post_supports_client_mutation_id`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 200 | Permissions error |
| 190 | Invalid OAuth 2.0 Access Token |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |
| 100 | Invalid parameter |
| 197 | The post is empty. Please enter a message to share. |
| 283 | That action requires the extended permission pages\_read\_engagement and/or pages\_read\_user\_content and/or pages\_manage\_ads and/or pages\_manage\_metadata |
| 1500 | The url you supplied is invalid |
| 80001 | There have been too many calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 194 | Missing at least one required parameter |

You can make a POST request to `messenger_lead_forms` edge from the following paths:

- [`/{page_id}/messenger_lead_forms`](https://developers.facebook.com/docs/graph-api/reference/page/messenger_lead_forms/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `account_id`<br>int64 | ID of the account |
| `block_send_api`<br>boolean | Whether to block messages sent using Send API while user is in Lead Gen Experience |
| `handover_app_id`<br>int64 | Hand over thread to specified app after leadgen is complete |
| `handover_summary`<br>boolean | Opt-in to get a summary message sent to the target HOP app at the end of the automated flow |
| `privacy_url`<br>URI | Privacy URL for Messenger Lead Gen Experience |
| `reminder_text`<br>string | Reminder text that will be sent to user after inactivity |
| `step_list`<br>array<JSON object> | List of steps in Messenger Lead Gen Experience<br>Required |
| `step_id`<br>int64 | step\_id<br>Required |
| `message`<br>string | message<br>Required |
| `step_type`<br>enum {QUESTION, CONFIRMATION, DISCLAIMER, DISQUALIFY, INFO, INTRO, SUMMARY, POST\_LEAD\_TRANSITION} | step\_type<br>Required |
| `reply_type`<br>enum {QUICK\_REPLIES, BUTTON\_XMA, TEXT, NONE, PREFILL, ICE\_BREAKERS, APPOINTMENT, SUBSCRIBE, CALL\_PREFERENCE, CONDITIONAL\_ANSWER} | reply\_type<br>Required |
| `answers`<br>array<string> | Default value: `[]`<br>answers |
| `next_step_ids`<br>array<int64> | Default value: `[]`<br>next\_step\_ids |
| `prefill_type`<br>enum {FULL\_ADDRESS, STREET\_ADDRESS, ZIP\_CODE, POST\_CODE, CITY, STATE, PROVINCE, COUNTRY, EMAIL, PHONE, JOB\_TITLE, COMPANY\_NAME, GENDER, DOB, DATE\_TIME, SLIDER, NONE, FIRST\_NAME, LAST\_NAME, FULL\_NAME, RELATIONSHIP\_STATUS, MARITAL\_STATUS, MILITARY\_STATUS, WORK\_EMAIL, WORK\_PHONE, NATIONAL\_ID\_BRAZIL, NATIONAL\_ID\_ARGENTINA, NATIONAL\_ID\_PERU, NATIONAL\_ID\_CHILE, NATIONAL\_ID\_COLOMBIA, NATIONAL\_ID\_ECUADOR, NATIONAL\_ID\_MEXICO} | Default value: `"NONE"`<br>prefill\_type |
| `crm_field_id`<br>string | crm\_field\_id |
| `answer_crm_field_ids`<br>array<string> | Default value: `[]`<br>answer\_crm\_field\_ids |
| `media_type`<br>enum {TEXT, IMAGE, VIDEO} | media\_type |
| `media_content`<br>string | media\_content |
| `options_format`<br>enum {TEXT, CAROUSEL} | Default value: `"TEXT"`<br>options\_format |
| `carousel_answers`<br>array<JSON object> | Default value: `[]`<br>carousel\_answers |
| `value`<br>string | value<br>Required |
| `media_content`<br>string | media\_content<br>Required |
| `answer_validation_enabled`<br>boolean | answer\_validation\_enabled |
| `invalid_reply_text`<br>string | invalid\_reply\_text |
| `cta`<br>JSON object | cta |
| `cta_type`<br>enum {VIEW\_WEBSITE, CALL\_BUSINESS, MESSAGE\_BUSINESS, DOWNLOAD, SCHEDULE\_APPOINTMENT, VIEW\_ON\_FACEBOOK, PROMO\_CODE, NONE, WHATSAPP, P2B\_MESSENGER, BOOK\_ON\_WEBSITE} | cta\_type<br>Required |
| `cta_text`<br>string | cta\_text<br>Required |
| `cta_content`<br>string | cta\_content<br>Required |
| `allow_to_skip`<br>boolean | allow\_to\_skip |
| `qualifying_answers_list`<br>array<string> | qualifying\_answers\_list |
| `next_step_on_disqualification_id`<br>int64 | next\_step\_on\_disqualification\_id |
| `offer_code_file_id`<br>int64 | offer\_code\_file\_id |
| `offer_code`<br>string | offer\_code |
| `offer_code_format`<br>string | offer\_code\_format |
| `stop_question_message`<br>string | Confirmation message after user clicks on the Stop Question option in persistent menu |
| `template_name`<br>string | Name for the form |
| `tracking_parameters`<br>JSON object {string : string} | Tracking Parameters of Lead Forms |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node represented by `id` in the return type.

Struct {

`id`: numeric string,

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |

You can make a POST request to `leadgen_forms` edge from the following paths:

- [`/{page_id}/leadgen_forms`](https://developers.facebook.com/docs/graph-api/reference/page/leadgen_forms/)

When posting to this edge, a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `allow_organic_lead_retrieval`<br>boolean | Default value: `true`<br>Previously, this flag controlled whether any leads submitted in a non-Ad context were retrievable. Now this flag will not be considered and it will be deprecated entirely. To control visibility of Lead Forms in a non-Ad context you should use 'block\_display\_for\_non\_targeted\_viewer' |
| `block_display_for_non_targeted_viewer`<br>boolean | Whether to make the organic post invisible to viewers in non-Ad context |
| `context_card`<br>Object | Optional context card shown as the intro page<br>Supports Emoji |
| `title`<br>string |  |
| `style`<br>enum {LIST\_STYLE, PARAGRAPH\_STYLE} |  |
| `content`<br>array<string> |  |
| `button_text`<br>string |  |
| `cover_photo_id`<br>numeric string |  |
| `cover_photo`<br>file | Custom cover photo for context card |
| `custom_disclaimer`<br>Object | Customized disclaimer including title, body content with inline links, and consent checkboxes<br>Supports Emoji |
| `title`<br>string |  |
| `body`<br>Object | Supports Emoji |
| `text`<br>string | Required |
| `url_entities`<br>array<JSON object> |  |
| `checkboxes`<br>list<Object> |  |
| `is_required`<br>boolean | Default value: `true` |
| `is_checked_by_default`<br>boolean | Default value: `false` |
| `text`<br>string | RequiredSupports Emoji |
| `key`<br>string | Supports Emoji |
| `follow_up_action_url`<br>URI | The final destination URL that user will go to when clicking view website button |
| `is_for_canvas`<br>boolean | Default value: `false`<br>Flag to indicate that the form is going to be used under a canvas |
| `is_optimized_for_quality`<br>boolean | Default value: `false`<br>Flag to indicate whether the form will be optimized for quality |
| `is_phone_sms_verify_enabled`<br>boolean | Default value: `false`<br>Whether the form requires phone sms verification when user submits |
| `locale`<br>enum {AR\_AR, CS\_CZ, DA\_DK, DE\_DE, EL\_GR, EN\_GB, EN\_US, ES\_ES, ES\_LA, FI\_FI, FR\_FR, HE\_IL, HI\_IN, HU\_HU, ID\_ID, IT\_IT, JA\_JP, KO\_KR, NB\_NO, NL\_NL, PL\_PL, PT\_BR, PT\_PT, RO\_RO, RU\_RU, SV\_SE, TH\_TH, TR\_TR, VI\_VN, ZH\_CN, ZH\_HK, ZH\_TW} | The locale of the form. Pre-defined questions renders in this locale |
| `name`<br>string | The name that will help identity the form<br>Required |
| `privacy_policy`<br>Object | The url and link\_text of the privacy policy of advertiser. link\_text is limited to a maximum of 70 characters.<br>Supports Emoji |
| `url`<br>string |  |
| `link_text`<br>string |  |
| `question_page_custom_headline`<br>string | The custom headline for the question page within the form |
| `questions`<br>list<Object> | An array of questions of the form<br>Required |
| `key`<br>string |  |
| `label`<br>string |  |
| `type`<br>enum {CUSTOM, CITY, COMPANY\_NAME, COUNTRY, DOB, EMAIL, GENDER, FIRST\_NAME, FULL\_NAME, JOB\_TITLE, LAST\_NAME, MARITIAL\_STATUS, WHATSAPP\_NUMBER, EDUCATION\_LEVEL, WEBSITE, PHONE, PHONE\_OTP, POST\_CODE, PROVINCE, RELATIONSHIP\_STATUS, STATE, STREET\_ADDRESS, ZIP, WORK\_EMAIL, MILITARY\_STATUS, WORK\_PHONE\_NUMBER, SLIDER, STORE\_LOOKUP, STORE\_LOOKUP\_WITH\_TYPEAHEAD, DATE\_TIME, ID\_CPF, ID\_AR\_DNI, ID\_CL\_RUT, ID\_CO\_CC, ID\_EC\_CI, ID\_PE\_DNI, ID\_MX\_RFC, JOIN\_CODE, USER\_PROVIDED\_PHONE\_NUMBER, FACEBOOK\_LEAD\_ID, EMAIL\_ALIAS, MESSENGER, VIN, LICENSE\_PLATE, THREAD\_LINK, ADDRESS\_LINE\_TWO} | Required |
| `inline_context`<br>string |  |
| `options`<br>array<JSON object> |  |
| `dependent_conditional_questions`<br>array<JSON object> |  |
| `conditional_questions_group_id`<br>numeric string |  |
| `should_enforce_work_email`<br>boolean | Whether to enable work email enforcement. |
| `thank_you_page`<br>Object | Optional customized thank you page displayed post submission<br>Supports Emoji |
| `title`<br>string | Required |
| `body`<br>string |  |
| `short_message`<br>string |  |
| `button_text`<br>string |  |
| `button_description`<br>string |  |
| `business_phone_number`<br>phone number string |  |
| `enable_messenger`<br>boolean | Default value: `false` |
| `website_url`<br>string |  |
| `button_type`<br>enum {VIEW\_WEBSITE, CALL\_BUSINESS, MESSAGE\_BUSINESS, DOWNLOAD, SCHEDULE\_APPOINTMENT, VIEW\_ON\_FACEBOOK, PROMO\_CODE, NONE, WHATSAPP, P2B\_MESSENGER, BOOK\_ON\_WEBSITE} | Required |
| `country_code`<br>string |  |
| `gated_file`<br>JSON object |  |
| `id`<br>numeric string | id |
| `tracking_parameters`<br>JSON object {string : string} | Map for additional tracking parameters to include with the form's field data |
| `upload_gated_file`<br>file | When using Meta's marketing API to create a lead ad, you can use this field to create a gated content thank you page. This field would be the file that you'd like to use as the gated file, and the thank you page button type should be VIEW\_ON\_FACEBOOK |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node represented by `id` in the return type.

Struct {

`id`: numeric string,

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 192 | Invalid phone number |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |
| 80005 | There have been too many leadgen api calls to this Page account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting. |
| 200 | Permissions error |
| 105 | The number of parameters exceeded the maximum for this operation |
| 190 | Invalid OAuth 2.0 Access Token |

## Updating

You can update a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) by making a POST request to [`/{page_id}`](https://developers.facebook.com/docs/graph-api/reference/page/).

### Parameters

| Parameter | Description |
| --- | --- |
| `about`<br>UTF-8 string | Update the `about` field. Note that this value is mapped to the **Description** setting in the **Edit Page Info** user interface.<br>Supports Emoji |
| `accept_crossposting_handshake`<br>array<JSON object> | Accepts a pending crossposting request initiated by another Page |
| `partner_page_id`<br>numeric string | partner\_page\_id<br>Required |
| `allow_live`<br>boolean | allow\_live<br>Required |
| `allow_spherical_photo`<br>boolean | Default value: `false`<br>Indicates that we should allow this photo to be treated as a spherical photo. This param will only be used when uploading a new image file. This will not change the behavior unless the server is able to interpret the photo as spherical, such as via Photosphere XMP metadata. Regular non-spherical photos will still be treated as regular photos even if this parameter is true. |
| `attire`<br>enum{Unspecified, Casual, Dressy} | Update the `attire` field |
| `begin_crossposting_handshake`<br>array<JSON object> | Begins the video crossposting handshake with another page |
| `partner_page_id`<br>numeric string | partner\_page\_id<br>Required |
| `allow_live`<br>boolean | allow\_live<br>Required |
| `category_list`<br>list<numeric string> | Update the `category_list` field |
| `company_overview`<br>string | Update the `company_overview` field |
| `contact_address`<br>Object | Update the `contact_address` field |
| `city_id`<br>city id |  |
| `street1`<br>string |  |
| `street2`<br>string |  |
| `zip`<br>string |  |
| `cover`<br>numeric string or integer | Update the `cover` field. This field can only be updated by the Page Admin or Page Editor with `EDIT_PROFILE` and [`business_management` permissions](https://developers.facebook.com/docs/apps/review/login-permissions#business-management). |
| `culinary_team`<br>string | Update the `culinary_team` field |
| `delivery_and_pickup_option_info`<br>array<string> | delivery\_and\_pickup\_option\_info. Each String represent the url link to a delivery and pick up option webpage. The API filters out duplicated urls as well as invalidated urls. If empty array is input, `delivery_and_pickup_option_info` field of the page will be cleared. |
| `description`<br>string | Update the `description` field. Note that this value is mapped to the **Additional Information** setting in the **Edit Page Info** user interface. |
| `differently_open_offerings`<br>JSON object {enum {ONLINE\_SERVICES, DELIVERY, PICKUP, OTHER} : boolean} | Indication of services currently offered by this business. Specify "true" for all that apply. Intended to be used when `temporary_status` = 'differently\_open'.<br>Note to restaurants: See `restaurant_services` for how to indicate longer term or permanent aspects of your business. |
| `directed_by`<br>string | Update the `directed_by` field |
| `displayed_message_response_time`<br>string | Page estimated message response time displayed to user |
| `emails`<br>list<string> | Update the `emails` field |
| `focus_x`<br>float | Cover photo focus x |
| `focus_y`<br>float | Cover photo focus y |
| `food_styles`<br>list<enum{Afghani, American (New), American (Traditional), Asian fusion, Barbeque, Brazilian, Breakfast, British, Brunch, Buffets, Burgers, Burmese, Cajun/Creole, Caribbean, Chinese, Creperies, Cuban, Delis, Diners, Ethiopian, Fast food, Filipino, Fondue, Food stands, French, German, Greek and Mediterranean, Hawaiian, Himalayan/Nepalese, Hot dogs, Indian/Pakistani, Irish, Italian, Japanese, Korean, Latin American, Mexican, Middle Eastern, Moroccan, Pizza, Russian, Sandwiches, Seafood, Singaporean, Soul food, Southern, Spanish/Basque, Steakhouses, Sushi bars, Taiwanese, Tapas bars, Tex-Mex, Thai, Turkish, Vegan, Vegetarian, Vietnamese}> | Update the `food_styles` field |
| `gen_ai_provenance_type`<br>enum {C2PA, IPTC, EXPLICIT, INVISIBLE\_WATERMARK, C2PA\_METADATA\_EDITED, IPTC\_METADATA\_EDITED, EXPLICIT\_IMAGINE, EXPLICIT\_IMAGINE\_ME, EXPLICIT\_RESTYLE, EXPLICIT\_ANIMATE} | gen\_ai\_provenance\_type |
| `general_info`<br>string | Update the `general_info` field |
| `general_manager`<br>string | Update the `general_manager` field |
| `genre`<br>string | Update the `genre` field |
| `hours`<br>dictionary { string : <> } | Update the `hours` field |
| `ignore_coordinate_warnings`<br>boolean | Ignore coordinate warnings when updating this Page's location |
| `impressum`<br>string | Update the `impressum` field |
| `is_always_open`<br>boolean | Is this location always open? |
| `is_permanently_closed`<br>boolean | Update the `is_permanently_closed` field |
| `is_published`<br>boolean | Update the `is_published` field |
| `is_webhooks_subscribed`<br>boolean | Is the application subscribed for real time updates from this page? |
| `location`<br>Object | Update the `location` field |
| `city`<br>string |  |
| `city_id`<br>city id |  |
| `state`<br>string |  |
| `country`<br>string |  |
| `street`<br>string |  |
| `zip`<br>string |  |
| `latitude`<br>float |  |
| `longitude`<br>float |  |
| `mission`<br>string | Update the `mission` field |
| `no_feed_story`<br>boolean | Default value: `false`<br>Don't generate a feed story for the cover photo |
| `no_notification`<br>boolean | Default value: `false`<br>Don't generate a notification for the cover photo |
| `offset_x`<br>integer | Default value: `50`<br>Cover photo offset x |
| `offset_y`<br>integer | Default value: `50`<br>Cover photo offset y |
| `parking`<br>dictionary { enum{street, lot, valet} : <boolean> } | Update the `parking` field |
| `payment_options`<br>dictionary { enum{cash\_only, visa, amex, mastercard, discover, credit\_cards} : <boolean> } | Update the `payment_options` field |
| `phone`<br>string | Update the `phone` field |
| `pickup_options`<br>array<enum {CURBSIDE, IN\_STORE, OTHER}> | List of pickup option types available at this Page's business location |
| `plot_outline`<br>string | Update the `plot_outline` field |
| `price_range`<br>string | Update the `price_range` field |
| `public_transit`<br>string | Update the `public_transit` field |
| `restaurant_services`<br>dictionary { enum{reserve, walkins, groups, kids, takeout, delivery, catering, waiter, outdoor} : <boolean> } | Update the `restaurant_services` field |
| `restaurant_specialties`<br>dictionary { enum{breakfast, lunch, dinner, coffee, drinks} : <boolean> } | Update the `restaurant_specialties` field |
| `scrape`<br>boolean | Re-scrape the website associated with this Page |
| `spherical_metadata`<br>JSON object | A set of params describing an uploaded spherical photo. This param will only be used when uploading a new image file. This field is not required; if it is not present we will try to generate spherical metadata from the metadata embedded in the image. If it is present, it takes precedence over any embedded metadata. Please click to the left to expand this list and see more information on each parameter. See also the Google Photo Sphere spec for more info on the meaning of the params: https://developers.google.com/streetview/spherical-metadata |
| `ProjectionType`<br>string | Accepted values include equirectangular (full spherical photo),<br>cylindrical (panorama), and cubestrip (also known as cubemap, e.g.<br>for synthetic or rendered content; stacked vertically with 6 faces).<br>Required |
| `CroppedAreaImageWidthPixels`<br>int64 | \-\-\- In equirectangular projection: As described in Google Photo Sphere<br>XMP Metadata spec.<br>\-\-\- In cylindrical projection: Very similar to equirectangular.<br>This value should be equal to the actual width of the image, and<br>together with FullPanoWidthPixels, it describes the horizontal FOV<br>of content of the image: HorizontalFOV = 360 \*<br>CroppedAreaImageWidthPixels / FullPanoWidthPixels.<br>\-\-\- In cubestrip projection: This has no relationship to the pixel<br>dimensions of the image. It is simply a representation of the<br>horizontal FOV of the content of the image.<br>HorizontalFOV = CroppedAreaImageWidthPixels / PixelsPerDegree,<br>where PixelsPerDegree is defined by FullPanoWidthPixels.<br>Required |
| `CroppedAreaImageHeightPixels`<br>int64 | \-\-\- In equirectangular projection: As described in Google Photo Sphere<br>XMP Metadata spec.<br>\-\-\- In cylindrical projection: This value will NOT be equal to<br>the actual height of the image. Instead, together with<br>FullPanoHeightPixels, it describes the vertical FOV of the image:<br>VerticalFOV = 180 \* CroppedAreaImageHeightPixels /<br>FullPanoHeightPixels. In other words, this value is equal to the<br>CroppedAreaImageHeightPixels value that this image would have, if it<br>were projected into equirectangular format while maintaining the<br>same FullPanoWidthPixels.<br>\-\-\- In cubestrip projection: This has no relationship to the pixel<br>dimensions of the image. It is simply a representation of the<br>vertical FOV of the content of the image.<br>VerticalFOV = CroppedAreaImageHeightPixels / PixelsPerDegree,<br>where PixelsPerDegree is defined by FullPanoWidthPixels.<br>Required |
| `FullPanoWidthPixels`<br>int64 | \-\-\- In equirectangular projection: As described in Google Photo Sphere<br>XMP Metadata spec.<br>\-\-\- In cylindrical projection: Very similar to<br>equirectangular. This value defines a ratio of horizontal pixels to<br>degrees in the space of the image, and in general the pixel to degree<br>ratio in the scope of the metadata object. Concretely, PixelsPerDegree =<br>FullPanoWidthPixels / 360. This is also equivalent to the<br>circumference of the cylinder used to model this projection.<br>\-\-\- In cubestrip projection: This value has<br>no relationship to the pixel dimensions of the image. It only defines<br>the pixel to degree ratio in the scope of the metadata object. It<br>represents the number of pixels in 360 degrees, so pixels per degree<br>is then given by: PixelsPerDegree = FullPanoWidthPixels / 360. As an<br>example, if FullPanoWidthPixels were chosen to be 3600, we would have<br>PixelsPerDegree = 3600 / 360 = 10. An image with a vertical field of<br>view of 65 degrees would then have a CroppedAreaImageHeightPixels value<br>of 65 \* 10 = 650.<br>Required |
| `FullPanoHeightPixels`<br>int64 | \-\-\- In equirectangular projection: As described in Google Photo Sphere<br>XMP Metadata spec.<br>\-\-\- In cylindrical projection: This value is equal<br>to the FullPanoHeightPixels value that this image would have, if it<br>were projected into equirectangular format while maintaining the<br>same FullPanoWidthPixels. It is always equal to<br>FullPanoWidthPixels / 2.<br>\-\-\- In cubestrip projection: This value has<br>no relationship to the pixel dimensions of the image. It is a second,<br>redundant representation of PixelsPerDegree.<br>FullPanoHeightPixels = 180 \* PixelsPerDegree. It must be consistent<br>with FullPanoWidthPixels:<br>FullPanoHeightPixels = FullPanoWidthPixels / 2.<br>Required |
| `CroppedAreaLeftPixels`<br>int64 | Default value: `0`<br>\-\-\- In equirectangular projection: As described in Google Photo Sphere<br>XMP Metadata spec.<br>\-\-\- In cylindrical projection: This value is equal<br>to the CroppedAreaLeftPixels value that this image would have, if it<br>were projected into equirectangular format while maintaining the<br>same FullPanoWidthPixels. It is just a representation of the same<br>angular offset that it represents in equirectangular projection in the<br>Google Photo Sphere spec.<br>Concretely, AngularOffsetFromLeftDegrees = CroppedAreaLeftPixels /<br>PixelsPerDegree, where PixelsPerDegree is defined by<br>FullPanoWidthPixels.<br>\-\-\- In cubestrip projection: This value has<br>no relationship to the pixel dimensions of the image. It is just a<br>representation of the same angular offset that it represents in<br>equirectangular projection in the Google Photo Sphere spec.<br>AngularOffsetFromLeftDegrees = CroppedAreaLeftPixels / PixelsPerDegree,<br>where PixelsPerDegree is defined by FullPanoWidthPixels. |
| `CroppedAreaTopPixels`<br>int64 | Default value: `0`<br>\-\-\- In equirectangular projection: As described in Google Photo Sphere<br>XMP Metadata spec.<br>\-\-\- In cylindrical projection: This value is equal<br>to the CroppedAreaTopPixels value that this image would have, if it<br>were projected into equirectangular format while maintaining the<br>same FullPanoWidthPixels. It is just a representation of the same<br>angular offset that it represents in equirectangular projection in the<br>Google Photo Sphere spec.<br>Concretely, AngularOffsetFromTopDegrees = CroppedAreaTopPixels /<br>PixelsPerDegree, where PixelsPerDegree is defined by<br>FullPanoWidthPixels.<br>\-\-\- In cubestrip projection: This value has<br>no relationship to the pixel dimensions of the image. It is just a<br>representation of the same angular offset that it represents in<br>equirectangular projection in the Google Photo Sphere spec.<br>AngularOffsetFromTopDegrees = CroppedAreaTopPixels / PixelsPerDegree,<br>where PixelsPerDegree is defined by FullPanoWidthPixels. |
| `PoseHeadingDegrees`<br>float |  |
| `PosePitchDegrees`<br>float |  |
| `PoseRollDegrees`<br>float |  |
| `InitialViewHeadingDegrees`<br>float |  |
| `InitialViewPitchDegrees`<br>float |  |
| `InitialViewRollDegrees`<br>float | This is not currently supported |
| `InitialViewVerticalFOVDegrees`<br>float | This is deprecated. Please use InitialVerticalFOVDegrees. |
| `InitialVerticalFOVDegrees`<br>float | You can set the intial vertical FOV of the image. You can set either<br>this field or InitialHorizontalFOVDegrees. |
| `InitialHorizontalFOVDegrees`<br>float | You can set the intial horizontal FOV of the image. You can set either<br>this field or InitialVerticalFOVDegrees. |
| `PreProcessCropLeftPixels`<br>int64 |  |
| `PreProcessCropRightPixels`<br>int64 |  |
| `start_info`<br>Object | Update the `start_info` field |
| `type`<br>enum{Unspecified, Born, Founded, Started, Opened, Created, Launched} | Required |
| `date`<br>Object |  |
| `year`<br>integer |  |
| `month`<br>integer |  |
| `day`<br>integer |  |
| `store_location_descriptor`<br>string | Update the `store_location_descriptor` field |
| `temporary_status`<br>enum {DIFFERENTLY\_OPEN, TEMPORARILY\_CLOSED, OPERATING\_AS\_USUAL, NO\_DATA} | Update the `temporary_status` field |
| `website`<br>URL | Update the `website` field |
| `zoom_scale_x`<br>float | Cover photo zoom scale x |
| `zoom_scale_y`<br>float | Cover photo zoom scale y |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node to which you POSTed.

Struct {

`success`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 200 | Permissions error |
| 210 | User not visible |
| 190 | Invalid OAuth 2.0 Access Token |
| 375 | This Page doesn't have a location descriptor. Add one to continue. |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |
| 320 | Photo edit failure |
| 283 | That action requires the extended permission pages\_read\_engagement and/or pages\_read\_user\_content and/or pages\_manage\_ads and/or pages\_manage\_metadata |
| 160 | Invalid geolocation type |
| 374 | Invalid store location descriptor update since this Page is not a location Page. |

You can update a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) by making a POST request to [`/{page_id}/assigned_users`](https://developers.facebook.com/docs/graph-api/reference/page/assigned_users/).

### Parameters

| Parameter | Description |
| --- | --- |
| `tasks`<br>array<enum {MANAGE, CREATE\_CONTENT, MODERATE, MESSAGING, ADVERTISE, ANALYZE, MODERATE\_COMMUNITY, MANAGE\_JOBS, PAGES\_MESSAGING, PAGES\_MESSAGING\_SUBSCRIPTIONS, READ\_PAGE\_MAILBOXES, VIEW\_MONETIZATION\_INSIGHTS, MANAGE\_LEADS, PROFILE\_PLUS\_FULL\_CONTROL, PROFILE\_PLUS\_MANAGE, PROFILE\_PLUS\_FACEBOOK\_ACCESS, PROFILE\_PLUS\_CREATE\_CONTENT, PROFILE\_PLUS\_MODERATE, PROFILE\_PLUS\_MODERATE\_DELEGATE\_COMMUNITY, PROFILE\_PLUS\_MESSAGING, PROFILE\_PLUS\_ADVERTISE, PROFILE\_PLUS\_ANALYZE, PROFILE\_PLUS\_REVENUE, PROFILE\_PLUS\_MANAGE\_LEADS, CASHIER\_ROLE, GLOBAL\_STRUCTURE\_MANAGEMENT, PROFILE\_PLUS\_GLOBAL\_STRUCTURE\_MANAGEMENT}> | Page permission tasks to assign this user |
| `user`<br>UID | Business user id or system user id<br>Required |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node to which you POSTed.

Struct {

`success`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 200 | Permissions error |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |

You can update a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) by making a POST request to [`/{page_id}/page_whatsapp_number_verification`](https://developers.facebook.com/docs/graph-api/reference/page/page_whatsapp_number_verification/).

### Parameters

| Parameter | Description |
| --- | --- |
| `verification_code`<br>string | The verification code which was sent to the WhatsApp number. |
| `whatsapp_number`<br>string | The WhatsApp number to be verified.<br>Required |

### Return Type

Struct {

`error_message`: string,

`verification_status`: enum,

`whatsapp_number_type`: int32,

`whatsapp_display_number`: string,

}

### Error Codes

| Error | Description |
| --- | --- |
| 200 | Permissions error |
| 100 | Invalid parameter |
| 104 | Incorrect signature |

## Deleting

This is only available to select developers. Please contact your Facebook Partner for more information.

You can dissociate a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) from a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) by making a DELETE request to [`/{page_id}/assigned_users`](https://developers.facebook.com/docs/graph-api/reference/page/assigned_users/).

### Parameters

| Parameter | Description |
| --- | --- |
| `user`<br>UID | Business scoped user id<br>Required |

### Return Type

Struct {

`success`: bool,

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |

You can dissociate a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) from a [Page](https://developers.facebook.com/docs/graph-api/reference/page/) by making a DELETE request to [`/{page_id}/locations`](https://developers.facebook.com/docs/graph-api/reference/page/locations/).

### Parameters

| Parameter | Description |
| --- | --- |
| `location_page_ids`<br>array<numeric string> | Array of Page IDs for the pages to delete<br>Required |
| `store_numbers`<br>array<int64> | Array of Store numbers for the pages to delete<br>Required |

### Return Type

Struct {

`status`: bool,

`data`: List \[\
\
Struct {\
\
`child_id`: string,\
\
`success`: bool,\
\
}\
\
\],

}

### Error Codes

| Error | Description |
| --- | --- |
| 368 | The action attempted has been deemed abusive or is otherwise disallowed |
| 190 | Invalid OAuth 2.0 Access Token |
| 371 | Invalid Page location update |
| 100 | Invalid parameter |

On This Page

[Page](https://developers.facebook.com/docs/graph-api/reference/page/#overview)

[Reading](https://developers.facebook.com/docs/graph-api/reference/page/#Reading)

[Requirements](https://developers.facebook.com/docs/graph-api/reference/page/#requirements)

[Example](https://developers.facebook.com/docs/graph-api/reference/page/#example)

[Parameters](https://developers.facebook.com/docs/graph-api/reference/page/#parameters)

[Fields](https://developers.facebook.com/docs/graph-api/reference/page/#fields)

[Edges](https://developers.facebook.com/docs/graph-api/reference/page/#edges)

[Error Codes](https://developers.facebook.com/docs/graph-api/reference/page/#error-codes)

[Creating](https://developers.facebook.com/docs/graph-api/reference/page/#Creating)

[Parameters](https://developers.facebook.com/docs/graph-api/reference/page/#parameters-2)

[Return Type](https://developers.facebook.com/docs/graph-api/reference/page/#return-type)

[Error Codes](https://developers.facebook.com/docs/graph-api/reference/page/#error-codes-2)

[Example](https://developers.facebook.com/docs/graph-api/reference/page/#example-2)

[Updating](https://developers.facebook.com/docs/graph-api/reference/page/#Updating)

[Parameters](https://developers.facebook.com/docs/graph-api/reference/page/#parameters-3)

[Return Type](https://developers.facebook.com/docs/graph-api/reference/page/#return-type-2)

[Error Codes](https://developers.facebook.com/docs/graph-api/reference/page/#error-codes-3)

[Deleting](https://developers.facebook.com/docs/graph-api/reference/page/#Deleting)

[Parameters](https://developers.facebook.com/docs/graph-api/reference/page/#parameters-4)

[Return Type](https://developers.facebook.com/docs/graph-api/reference/page/#return-type-3)

[Error Codes](https://developers.facebook.com/docs/graph-api/reference/page/#error-codes-4)