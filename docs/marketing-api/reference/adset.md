![](https://googleads.g.doubleclick.net/pagead/viewthroughconversion/963623955/?guid=ON&script=0)

![](https://dc.ads.linkedin.com/collect/?pid=276116&fmt=gif)

![](https://analytics.twitter.com/i/adsct?txn_id=nz7m3&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0)

![](https://t.co/i/adsct?txn_id=nz7m3&p_id=Twitter&tw_sale_amount=0&tw_order_quantity=0)

![](https://facebook.com/security/hsts-pixel.gif)

[Meta logo](https://developers.facebook.com/?no_redirect=true)

MoreMoreMore

DocsDocsDocs

ToolsToolsTools

SupportSupportSupport

Search input

​

[LoginLoginLogin](https://business.facebook.com/business/loginpage/?is_work_accounts=true&login_options[0]=FB&login_options[1]=SSO&config_ref=biz_login_tool_flavor_dfc&app=436761779744620&next=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fmarketing-api%2Freference%2Fad-campaign%3Fnav_ref%3Dbiz_unified_f3_login_page_to_dfc)

[Marketing API](https://developers.facebook.com/docs/marketing-api)

- [Overview](https://developers.facebook.com/docs/marketing-api/overview)
- [Get Started](https://developers.facebook.com/docs/marketing-api/get-started)
- [Ad Creative](https://developers.facebook.com/docs/marketing-api/creative)
- [Bidding](https://developers.facebook.com/docs/marketing-api/bidding)
- [Ad Rules Engine](https://developers.facebook.com/docs/marketing-api/ad-rules)
- [Audiences](https://developers.facebook.com/docs/marketing-api/audiences)
- [Insights API](https://developers.facebook.com/docs/marketing-api/insights)
- [Brand Safety and Suitability](https://developers.facebook.com/docs/marketing-api/brand-safety-and-suitability)
- [Best Practices](https://developers.facebook.com/docs/marketing-api/best-practices)
- [Troubleshooting](https://developers.facebook.com/docs/marketing-api/troubleshooting)
- [API Reference](https://developers.facebook.com/docs/marketing-api/reference)


  - [Ad Account](https://developers.facebook.com/docs/marketing-api/reference/ad-account)
  - [Ad Image](https://developers.facebook.com/docs/marketing-api/reference/ad-image)
  - [Ad Previews](https://developers.facebook.com/docs/marketing-api/generatepreview)
  - [Ad Preview Plugin](https://developers.facebook.com/docs/marketing-api/ad-preview-plugin)
  - [Business](https://developers.facebook.com/docs/marketing-api/reference/business)
  - [Business Role Request](https://developers.facebook.com/docs/marketing-api/reference/business-role-request)
  - [Business User](https://developers.facebook.com/docs/marketing-api/reference/business-user)
  - [Currencies](https://developers.facebook.com/docs/marketing-api/currencies)
  - [High Demand Period](https://developers.facebook.com/docs/marketing-api/reference/high-demand-period)
  - [Image Crop](https://developers.facebook.com/docs/marketing-api/image-crops)
  - [Product Catalog](https://developers.facebook.com/docs/marketing-api/reference/product-catalog)
  - [System User](https://developers.facebook.com/docs/marketing-api/reference/system-user)

- [Changelog](https://developers.facebook.com/docs/marketing-api/marketing-api-changelog)

On This Page

[Ad Set](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#overview)

[Reading](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#Reading)

[Examples](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#read-examples)

[Example](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#example)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#parameters)

[Fields](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#fields)

[Edges](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#edges)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#error-codes)

[Creating](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#Creating)

[Examples](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#create-examples)

[Considerations](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#create-considerations)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#parameters-2)

[Return Type](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#return-type)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#error-codes-2)

[Example](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#example-2)

[Updating](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#Updating)

[Examples](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#update-examples)

[Remarks](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#remarks)

[Deleting](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#Deleting)

[Examples](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#delete-examples)

[Example](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#example-3)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#parameters-3)

[Return Type](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#return-type-2)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#error-codes-3)

[Outcome-Driven Ads Experiences](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#odax)

[Example](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#example-4)

[Restrictions](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#restrictions)

Graph API Version

[v25.0](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#)

# Ad Set

Beginning September 2, 2025, we will start to roll out more proactive restrictions on custom audiences and custom conversions that may suggest information not permitted under [our terms](https://www.facebook.com/legal/terms/businesstools?_rdr). For example, any custom audience or custom conversions suggesting specific health conditions (e.g., "arthritis", "diabetes") or financial status (e.g., "credit score", "high income") will be flagged and prevented from being used to run ad campaigns.

**What these restrictions mean for your campaigns:**

- You won’t be able to use flagged custom audiences or custom conversions when creating new campaigns.
- If you have an active campaign using flagged custom audiences or custom conversions, you should promptly review and resolve the issues by following the resolution steps to avoid delivery and performance issues.

**For API developers:**

- Starting September 2, 2025, if an ad set contains one or more flagged custom audiences and custom conversions, the [`issues_info` list](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#Reading) will be populated with one issue per flagged items.
- Creation and editing of ad sets that contain flagged custom audiences and custom conversions will not be blocked, but campaign delivery and performance may be impacted unless the flags are resolved.

More information on this update and how to resolve flagged custom audiences can be found [here](https://www.facebook.com/business/help/1055828013359808), while information for resolving flagged custom conversions is available [here](https://www.facebook.com/business/help/2455915321411996).

An ad set is a group of ads that share the same daily or lifetime budget, schedule, bid type, bid info, and targeting data. Ad sets enable you to group ads according to your criteria, and you can retrieve the ad-related statistics that apply to a set. See [Optimized CPM](https://developers.facebook.com/docs/marketing-api/optimizedcpm) and [Promoted Object](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign/promoted-object).

For example, create an ad set with a daily budget:

```html
curl -X POST \
  -F 'name="My Reach Ad Set"' \
  -F 'optimization_goal="REACH"' \
  -F 'billing_event="IMPRESSIONS"' \
  -F 'bid_amount=2' \
  -F 'daily_budget=1000' \
  -F 'campaign_id="<AD_CAMPAIGN_ID>"' \
  -F 'targeting={
       "geo_locations": {
         "countries": [\
           "US"\
         ]
       },
       "facebook_positions": [\
         "feed"\
       ]
     }' \
  -F 'status="PAUSED"' \
  -F 'promoted_object={
       "page_id": "<PAGE_ID>"
     }' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/act_<AD_ACCOUNT_ID>/adsets
```

Create an ad set with a lifetime budget

```html
curl -X POST \
  -F 'name="My First Adset"' \
  -F 'lifetime_budget=20000' \
  -F 'start_time="2025-12-04T20:32:30-0800"' \
  -F 'end_time="2025-12-14T20:32:30-0800"' \
  -F 'campaign_id="<AD_CAMPAIGN_ID>"' \
  -F 'bid_amount=100' \
  -F 'billing_event="LINK_CLICKS"' \
  -F 'optimization_goal="LINK_CLICKS"' \
  -F 'targeting={
       "facebook_positions": [\
         "feed"\
       ],
       "geo_locations": {
         "countries": [\
           "US"\
         ]
       },
       "publisher_platforms": [\
         "facebook",\
         "audience_network"\
       ]
     }' \
  -F 'status="PAUSED"' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/act_<AD_ACCOUNT_ID>/adsets
```

### Limits

The following are the limits on ad sets

| Limit | Value |
| --- | --- |
| Maximum number of ad sets per regular ad account | 5000 non-deleted ad sets |
| Maximum number of ad sets per bulk ad account | 10000 non-deleted ad sets |
| Maximum number of ads per ad set | 50 non-archived ads |

### Housing, Employment and Credit Ads

Facebook is committed to protecting people from discrimination, and we are continually improving our ability to detect and deter potential abuse. It’s already against [our policies](https://www.facebook.com/policies/ads/prohibited_content/discriminatory_practices) to discriminate by wrongfully targeting or excluding specific groups of people. As part of a [historic settlement agreement](https://l.facebook.com/l.php?u=https%3A%2F%2Fnewsroom.fb.com%2Fnews%2F2019%2F03%2Fprotecting-against-discrimination-in-ads%2F&h=AT4lbZ087NdgeE7dN82fGRQCQ4v0dcocuE09Tap9dRV9P37M87hhXSFTYKnIa-1rgRHSMY9gwUM0ANDfA5bde_mpGJUc4zquuP1M6vZQIXbORTC7nvfvgt7zVeCozdeq6_ugrKtBAheqrA), we are making changes to the way we manage housing, employment and credit ads.

Advertisers must specify a `special_ad_category` for ad campaigns that market housing, employment, and credit. In doing so, the set of targeting options available for ads in these campaigns will be restricted. See [Special Ad Category](https://developers.facebook.com/docs/marketing-api/special-ad-category) for more information.

### Flagged custom conversions, custom audiences and/or lookalike audiences

If an ad set contains one or more custom lookalike audiences flagged with an `operation_status` of `471`, the `issues_info` list will be populated with one issue per flagged audience as warning.

**Example**

```html
{
  "effective_status": "ACTIVE",
  "issues_info": [\
    {\
      "level": "AD_SET",\
      "error_code": 2460003,\
      "error_summary": "Custom Audience is blocked",\
      "error_message": "Custom Audience is blocked: Some of this ad set’s custom audiences and/or lookalikes are blocked because they suggest the use of information (e.g., health, financial) not allowed under Meta’s terms. Go to Audience Manager for more details, and you can either review each custom audience or lookalike and remove prohibited information, or choose a different one for your ad set or create a new one and make sure it does not include potentially prohibited information. You can also request a review in Audience Manager if you think any don’t use restricted information.",\
      "error_type": "SOFT_ERROR",\
      "additional_info": "Custom Audience ID: 120231141155310247"\
    },\
    {\
      "level": "AD_SET",\
      "error_code": 2460003,\
      "error_summary": "Custom Audience is blocked",\
      "error_message": "Custom Audience is blocked: Some of this ad set’s custom audiences and/or lookalikes are blocked because they suggest the use of information (e.g., health, financial) not allowed under Meta’s terms. Go to Audience Manager for more details, and you can either review each custom audience or lookalike and remove prohibited information, or choose a different one for your ad set or create a new one and make sure it does not include potentially prohibited information. You can also request a review in Audience Manager if you think any don’t use restricted information.",\
      "error_type": "SOFT_ERROR",\
      "additional_info": "Custom Audience ID: 120232742978230247"\
    },\
    {\
      "level": "AD_SET",\
      "error_code": 2460004,\
      "error_summary": "Custom Conversion is blocked",\
      "error_message": "Custom Conversion is blocked: This ad set’s custom conversion is blocked because it suggests the use of information (e.g., health, financial) not allowed under Meta’s terms. You can’t edit this custom conversion, but you can choose a different one for this ad set or create a new one that doesn’t use prohibited information. You can also request a review if you think your custom conversion doesn’t use prohibited information.",\
      "error_type": "SOFT_ERROR",\
      "additional_info": "Custom Conversion ID: 730362226205831"\
    }\
  ],
  "id": "120228591637010247"
}
```

In addition, attempting to create or modify ad sets containing any flagged custom audience, lookalike audience or custom conversion will fail with an error. The error will contain the list of IDs for the restricted assets.

##### For flagged custom audiences

```json
{
  "error": {
    "error_subcode": 246003,
    "error_data": {
      "Restricted Custom Audience IDs": [\
        "<CUSTOM_AUDIENCE_ID1>",\
        "<CUSTOM_AUDIENCE_ID2>"\
      ]
    }
    "error_user_title": "Your custom audience is currently blocked",
    "error_user_msg": "	This custom audience is blocked because it may contain information (e.g., health, financial) not allowed under Meta’s terms. Visit the audience manager to appeal this decision, edit your audience and remove prohibited information, or choose a different audience."
  },
}
```

##### For flagged custom conversions

```json
{
  "error": {
    "error_subcode": 246004,
    "error_data": {
      "Restricted Custom Conversion ID": "<CUSTOM_CONVERSION_ID>"
    }
    "error_user_title": "Your custom conversion is currently blocked",
    "error_user_msg": "This custom conversion is blocked because it may contain information (e.g., health, financial) not allowed under Meta’s terms. Visit the events manager to appeal this decision, edit your custom conversion and remove prohibited information, or choose a different custom conversion."
  },
}
```

#### To resolve flagged audiences

If your custom or lookalike audiences are flagged, consider these options.

To resolve flagged custom audiences:

- **Review flagged audiences**: Use Audience Manager to review your custom audience along with other information included in an audience, and remove any information that is not allowed under edit the audience to comply with [Meta's terms](https://www.facebook.com/legal/terms/businesstools/).
- **Create new or choose different audiences**: Alternatively, you can create a new custom audience or choose a different existing custom audience and make sure that it does not include information not allowed under our terms and use that to run campaigns.

To resolve flagged lookalike audiences:

- **Resolve issues with the underlying custom audience**: If the underlying custom audience (also known as the seed audience) of your lookalike audience is flagged, you will need to resolve the issue with the underlying custom audience on which the lookalike audience is built. Please refer to the preceding section on how to resolve flagged custom audiences.
- **Create new audiences**: Consider developing new lookalike audiences and make sure that they don't include information that is not allowed under our terms.

##### Request a review

If you believe your custom audience or lookalike audience has been flagged in error and doesn't include non-permitted information, you can request a review via Ads Manager under the campaigns table or, or in Audience Manager by clicking on individual audiences and under the summary tab of the impacted audience.

#### To resolve flagged custom conversions

If any of your custom conversions are flagged for suggesting information that is not allowed under our terms, you may want to consider the following options.

To resolve a flagged custom conversion in a new campaign creation:

- **Create new custom conversion**: Use a new custom conversion and make sure that it does not include information that is not allowed under our terms.
- **Choose a different custom conversion**: Select a different existing custom conversion and make sure it does not include information that is not allowed under our terms.

To resolve a flagged custom conversion in an existing campaign:

- **Duplicate your campaign and select an existing custom conversion**: If you have a running campaign that is flagged due to a flagged custom conversion, consider duplicating the campaign and selecting a different custom conversion that is not flagged before publishing the new duplicated campaign. **Note:** Once the campaign is published, you cannot remove or select a different custom conversion.

##### Request a review

If you believe your custom conversion has been flagged in error and doesn't include non-permitted information, you can request a review via Ads Manager under the campaigns table, or in Events Manager under the custom conversions page.

### Targeting European Union Ads

Beginning Tuesday, May 16, 2023 advertisers who include the European Union (EU), associated territories, or select global/worldwide in their ad targeting on Facebook and Instagram will be asked to include information about who benefits from the ad (the beneficiary) and who is paying for the ad (the payor) for each ad set. Advertisers will be prompted for this information in all ads buying surfaces including Ads Manager and the Marketing API. Beginning Wednesday, August 16, 2023, if beneficiary and payer information is not provided, the ad will not be published.

We are launching this requirement to respond to the EU Digital Services Act (DSA) which goes into full effect for Facebook and Instagram later this year.

Ad sets targeted to the EU and/or associated territories (see [here](https://www.facebook.com/business/help/605021638170961/) for a complete list) are required to provide beneficiary information (who benefits from the ad running), and payer information (who pays for the ad). This applies to new ads, duplicated ads, or significantly edited ads from May 16 forward, and without the required information, the API will respond with a wrong parameter error. For convenience the advertiser can set a saved beneficiary and payor in their ad account, which will be auto-populated during ad set creation, copying, and updating targets to include EU locations and ads under existing ad seta without configured the payor and beneficiary.. For more information about the ad account level parameters, `default_dsa_payor` and `default_dsa_beneficiary`, see to the check the [Ad Account reference document](https://developers.facebook.com/docs/marketing-api/reference/ad-account).

To facilitate the creation of ad sets targeting the EU, we're offering a new API which allows developers to get a list of likely beneficiary/payer strings, based on ad account activity. See [Ad Account DSA Recommendations](https://developers.facebook.com/docs/marketing-api/reference/ad-account/dsa_recommendations) for more information.

**Notice:**

- When the default values are set in the ad account, during ad set creation, updating, and ad creation under an existing ad set, if one of them is not provided, the API will automatically fill the default value listed in the ad account. **Do not pass only one of them and expect the API to set the other one to be the same value.** For example, in the ad account settings, `default_dsa_payor` is `payor_default` and `default_dsa_beneficiary` is `beneficiary_default`. During ad set creation, if only `dsa_payor` is passed with the payor, the `dsa_beneficiary` will be automatically filled with value of `beneficiary_default` instead of `dsa_payor`.
- If no saved default values are set or the values are unset, without explicitly passing the payor or beneficiary during ad set creation or when making updates, it will trigger an error and the request will fail.
- The `payer` and the `beneficiary` fields are only for ad sets targeting the EU and/or associated territories.
- For ad sets targeting regions other than the EU and/or associated territories, that information will not be saved even if it is provided.

To facilitate the creation of ad sets targeting the EU, we're offering a new API which allows developers to get a list of likely beneficiary/payer strings, based on ad account activity. See [Ad Account Dsa Recommendations](https://developers.facebook.com/docs/marketing-api/reference/ad-account/dsa_recommendations) for more information.

## Reading

An ad set is a group of ads that share the same daily or lifetime budget, schedule, bid type, bid info, and targeting data. Ad sets enable you to group ads according to your criteria, and you can retrieve the ad-related statistics that apply to a set.

The `date_preset = lifetime` parameter is disabled in Graph API v10.0 and replaced with `date_preset = maximum`, which returns a maximum of 37 months of data. For v9.0 and below, `date_preset = maximum` will be enabled on May 25, 2021, and any `lifetime` calls will default to `maximum` and return only 37 months of data.

### Examples

```html
curl -X GET \
  -d 'fields="name,status"' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/<AD_SET_ID>/
```

To retrieve date-time related fields in a UNIX timestamp format, use the `date_format` parameter:

```html
curl -X GET \
  -d 'fields="id,name,start_time,end_time"' \
  -d 'date_format="U"' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/<AD_SET_ID>/
```

### Example

HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDKcURL [Graph API Explorer](https://developers.facebook.com/tools/explorer/?method=GET&path=%3CAD_SET_ID%3E%2F%3Ffields%3Dadset_schedule&version=v25.0)

```
GET /v25.0/<AD_SET_ID>/?fields=adset_schedule HTTP/1.1
Host: graph.facebook.com
```

```
/* PHP SDK v5.0.0 */
/* make the API call */
try {
  // Returns a `Facebook\FacebookResponse` object
  $response = $fb->get(
    '/<AD_SET_ID>/?fields=adset_schedule',
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
    "/<AD_SET_ID>/",
    {
        "fields": "adset_schedule"
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
params.putString("fields", "adset_schedule");
/* make the API call */
new GraphRequest(
    AccessToken.getCurrentAccessToken(),
    "/<AD_SET_ID>/",
    params,
    HttpMethod.GET,
    new GraphRequest.Callback() {
        public void onCompleted(GraphResponse response) {
            /* handle the result */
        }
    }
).executeAsync();
```

```
NSDictionary *params = @{
  @"fields": @"adset_schedule",
};
/* make the API call */
FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]\
                               initWithGraphPath:@"/<AD_SET_ID>/"\
                                      parameters:params\
                                      HTTPMethod:@"GET"];
[request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection,\
                                      id result,\
                                      NSError *error) {\
    // Handle the result\
}];
```

```
curl -X GET -G \
  -d 'fields="adset_schedule"' \
  -d 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/<AD_SET_ID>/
```

If you want to learn how to use the Graph API, read our [Using Graph API guide](https://developers.facebook.com/docs/graph-api/using-graph-api/).

### Parameters

| Parameter | Description |
| --- | --- |
| `date_preset`<br>enum{today, yesterday, this\_month, last\_month, this\_quarter, maximum, data\_maximum, last\_3d, last\_7d, last\_14d, last\_28d, last\_30d, last\_90d, last\_week\_mon\_sun, last\_week\_sun\_sat, last\_quarter, last\_year, this\_week\_mon\_today, this\_week\_sun\_today, this\_year} | Date Preset |
| `time_range`<br>{'since':YYYY-MM-DD,'until':YYYY-MM-DD} | Time Range. Note if time range is invalid, it will be ignored. |
| `since`<br>datetime | A date in the format of "YYYY-MM-DD", which means from the beginning midnight of that day. |
| `until`<br>datetime | A date in the format of "YYYY-MM-DD", which means to the beginning midnight of the following day. |

### Fields

| Field | Description |
| --- | --- |
| `id`<br>numeric string | ID for the Ad Set<br>[Default](https://developers.facebook.com/docs/graph-api/using-graph-api/#fields) |
| `account_id`<br>numeric string | ID for the Ad Account associated with this Ad Set |
| `adlabels`<br>[list<AdLabel>](https://developers.facebook.com/docs/marketing-api/reference/ad-label/) | Ad Labels associated with this ad set |
| `adset_schedule`<br>list<DayPart> | Ad set schedule, representing a delivery schedule for a single day |
| `asset_feed_id`<br>numeric string | The ID of the asset feed that constains a content to create ads |
| `attribution_spec`<br>list<AttributionSpec> | Conversion attribution spec used for attributing conversions for optimization. Supported window lengths differ by optimization goal and campaign objective. See [Objective, Optimization Goal and `attribution_spec`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#attribution_spec). |
| `bid_adjustments`<br>[AdBidAdjustments](https://developers.facebook.com/docs/marketing-api/reference/ad-bid-adjustments/) | Map of bid adjustment types to values |
| `bid_amount`<br>unsigned int32 | Bid cap or target cost for this ad set. The bid cap used in a _lowest cost bid strategy_ is defined as the maximum bid you want to pay for a result based on your `optimization_goal`. The target cost used in a _target cost bid strategy_ lets Facebook bid on your behalf to meet your target on average and keep costs stable as you raise budget.<br>The bid amount's unit is cents for currencies like USD, EUR, and the basic unit for currencies like JPY, KRW. The bid amount for ads with `IMPRESSION` or `REACH` as `billing_event` is per 1,000 occurrences of that event, and the bid amount for ads with other `billing_event`s is for each occurrence. |
| `bid_constraints`<br>[AdCampaignBidConstraint](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-bid-constraint/) | Choose bid constraints for ad set to suit your specific business goals. It usually works together with `bid_strategy` field. |
| `bid_info`<br>map<string, unsigned int32> | Map of bid objective to bid value. |
| `bid_strategy`<br>enum {LOWEST\_COST\_WITHOUT\_CAP, LOWEST\_COST\_WITH\_BID\_CAP, COST\_CAP, LOWEST\_COST\_WITH\_MIN\_ROAS} | Bid strategy for this ad set when you use `AUCTION` as your buying type:<br>`LOWEST_COST_WITHOUT_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` without limiting your bid amount. This is the best strategy<br>if you care most about cost efficiency. However with this strategy it may be harder to get<br>stable average costs as you spend. This strategy is also known as _automatic bidding_.<br>Learn more in [Ads Help Center, About bid strategies: Lowest cost](https://www.facebook.com/business/help/721453268045071).<br>`LOWEST_COST_WITH_BID_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` while limiting actual bid to your specified<br>amount. With a bid cap you have more control over your<br>cost per actual optimization event. However if you set a limit which is too low you may<br>get less ads delivery. Get your bid cap with the field `bid_amount`.<br>This strategy is also known as _manual maximum-cost bidding_.<br>Learn more in [Ads Help Center, About bid strategies: Lowest cost](https://www.facebook.com/business/help/721453268045071).<br>Notes:<br>- If you enable campaign budget optimization, you should get `bid_strategy` at the parent campaign level.<br>- `TARGET_COST` bidding strategy has been deprecated with [Marketing API v9](https://developers.facebook.com/docs/graph-api/changelog/version9.0). |
| `billing_event`<br>enum {APP\_INSTALLS, CLICKS, IMPRESSIONS, LINK\_CLICKS, NONE, OFFER\_CLAIMS, PAGE\_LIKES, POST\_ENGAGEMENT, THRUPLAY, PURCHASE, LISTING\_INTERACTION} | The billing event for this ad set:<br>`APP_INSTALLS`: Pay when people install your app.<br>`CLICKS`: Pay when people click anywhere in the ad. <br>`IMPRESSIONS`: Pay when the ads are shown to people.<br>`LINK_CLICKS`: Pay when people click on the link of the ad.<br>`OFFER_CLAIMS`: Pay when people claim the offer.<br>`PAGE_LIKES`: Pay when people like your page.<br>`POST_ENGAGEMENT`: Pay when people engage with your post.<br>`VIDEO_VIEWS`: Pay when people watch your video ads for at least 10 seconds.<br>`THRUPLAY`: Pay for ads that are played to completion, or played for at least 15 seconds. |
| `brand_safety_config`<br>BrandSafetyCampaignConfig | brand\_safety\_config |
| `budget_remaining`<br>numeric string | Remaining budget of this Ad Set |
| `campaign`<br>[Campaign](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/) | The campaign that contains this ad set |
| `campaign_active_time`<br>numeric string | Campaign running length |
| `campaign_attribution`<br>enum | campaign\_attribution, a new field for app ads campaign, used to indicate a campaign's attribution type, eg: SKAN or AEM |
| `campaign_id`<br>numeric string | The ID of the campaign that contains this ad set |
| `configured_status`<br>enum {ACTIVE, PAUSED, DELETED, ARCHIVED} | The status set at the ad set level. It can be different from the<br>effective status due to its parent campaign. Prefer using 'status'<br>instead of this. |
| `contextual_bundling_spec`<br>ContextualBundlingSpec | specs of contextual bundling Ad Set setup, including signal of opt-in/out the feature |
| `created_time`<br>datetime | Time when this Ad Set was created |
| `creative_sequence`<br>list<numeric string> | Order of the adgroup sequence to be shown to users |
| `daily_budget`<br>numeric string | The daily budget of the set defined in your [account currency](https://developers.facebook.com/docs/marketing-api/adset/budget-limits). |
| `daily_min_spend_target`<br>numeric string | Daily minimum spend target of the ad set defined in your account currency. To use this field, daily budget must be specified in the Campaign. This target is not a guarantee but our best effort. |
| `daily_spend_cap`<br>numeric string | Daily spend cap of the ad set defined in your account currency. To use this field, daily budget must be specified in the Campaign. |
| `destination_type`<br>string | Destination of ads in this Ad Set.<br>Options include: `WEBSITE`, `APP`, `MESSENGER`, `INSTAGRAM_DIRECT`.<br>The `ON_AD`, `ON_POST`, `ON_VIDEO`, `ON_PAGE`, and `ON_EVENT` destination types are currently in limited beta testing. Trying to duplicate campaigns with existing destination types using these new destination types may throw an error. See the [Outcome-Driven Ads Experiences](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign#odax) section below for more information. |
| `dsa_beneficiary`<br>string | The beneficiary of all ads in this ad set. |
| `dsa_payor`<br>string | The payor of all ads in this ad set. |
| `effective_status`<br>enum {ACTIVE, PAUSED, DELETED, CAMPAIGN\_PAUSED, ARCHIVED, IN\_PROCESS, WITH\_ISSUES} | The effective status of the adset. The status could be effective either<br>because of its own status, or the status of its parent campaign. `WITH_ISSUES` is available for version 3.2 or higher. `IN_PROCESS` is available for version 4.0 or higher. |
| `end_time`<br>datetime | End time, in UTC UNIX timestamp |
| `frequency_control_specs`<br>[list<AdCampaignFrequencyControlSpecs>](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-frequency-control-specs/) | An array of frequency control specs for this ad set. Writes to this field are only available in ad sets where `REACH` and `THRUPLAY` are the performance goal. |
| `instagram_user_id`<br>numeric string | Represents your Instagram account id, used for ads, including dynamic creative ads on Instagram. |
| `is_dynamic_creative`<br>bool | Whether this ad set is a dynamic creative ad set. dynamic creative ad can be created only under ad set with this field set to be true. |
| `is_incremental_attribution_enabled`<br>bool | Whether the campaign should use incremental attribution optimization. |
| `issues_info`<br>[list<AdCampaignIssuesInfo>](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-issues-info/) | Issues for this ad set that prevented it from deliverying |
| `learning_stage_info`<br>[AdCampaignLearningStageInfo](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-learning-stage-info/) | Info about whether the ranking or delivery system is still learning for this ad set. While the ad set is still in learning , we might unstablized delivery performances. |
| `lifetime_budget`<br>numeric string | The lifetime budget of the set defined in your [account currency](https://developers.facebook.com/docs/marketing-api/adset/budget-limits). |
| `lifetime_imps`<br>int32 | Lifetime impressions. Available only for campaigns with `buying_type=FIXED_CPM` |
| `lifetime_min_spend_target`<br>numeric string | Lifetime minimum spend target of the ad set defined in your account currency. To use this field, lifetime budget must be specified in the Campaign. This target is not a guarantee but our best effort. |
| `lifetime_spend_cap`<br>numeric string | Lifetime spend cap of the ad set defined in your account currency. To use this field, lifetime budget must be specified in the Campaign. |
| `min_budget_spend_percentage`<br>numeric string | min\_budget\_spend\_percentage |
| `multi_optimization_goal_weight`<br>string | multi\_optimization\_goal\_weight |
| `name`<br>string | Name of the ad set |
| `optimization_goal`<br>enum {NONE, APP\_INSTALLS, AD\_RECALL\_LIFT, ENGAGED\_USERS, EVENT\_RESPONSES, IMPRESSIONS, LEAD\_GENERATION, QUALITY\_LEAD, LINK\_CLICKS, OFFSITE\_CONVERSIONS, PAGE\_LIKES, POST\_ENGAGEMENT, QUALITY\_CALL, REACH, LANDING\_PAGE\_VIEWS, VISIT\_INSTAGRAM\_PROFILE, ENGAGED\_PAGE\_VIEWS, VALUE, THRUPLAY, DERIVED\_EVENTS, APP\_INSTALLS\_AND\_OFFSITE\_CONVERSIONS, CONVERSATIONS, IN\_APP\_VALUE, MESSAGING\_PURCHASE\_CONVERSION, SUBSCRIBERS, REMINDERS\_SET, MEANINGFUL\_CALL\_ATTEMPT, PROFILE\_VISIT, PROFILE\_AND\_PAGE\_ENGAGEMENT, ADVERTISER\_SILOED\_VALUE, AUTOMATIC\_OBJECTIVE, MESSAGING\_APPOINTMENT\_CONVERSION} | The optimization goal this ad set is using.<br>`NONE`: Only available in read mode for campaigns created pre-v2.4.<br>`APP_INSTALLS`: Optimize for people more likely to install your app.<br>`AD_RECALL_LIFT`: Optimize for people more likely to remember seeing your ads.<br>`CLICKS`: Deprecated. Only available in read mode.<br>`ENGAGED_USERS`: Optimize for people more likely to take a particular action in your app.<br>`EVENT_RESPONSES`: Optimize for people more likely to attend your event.<br>`IMPRESSIONS`: Show the ads as many times as possible.<br>`LEAD_GENERATION`: Optimize for people more likely to fill out a lead generation form.<br>`QUALITY_LEAD`: Optimize for people who are likely to have a deeper conversation with advertisers after lead submission.<br>`LINK_CLICKS`: Optimize for people more likely to click in the link of the ad.<br>`OFFSITE_CONVERSIONS`: Optimize for people more likely to make a conversion on the site.<br>`PAGE_LIKES`: Optimize for people more likely to like your page.<br>`POST_ENGAGEMENT`: Optimize for people more likely to engage with your post.<br>`QUALITY_CALL`: Optimize for people who are likely to call the advertiser.<br>`REACH`: Optimize to reach the most unique users for each day or interval specified in `frequency_control_specs`.<br>`LANDING_PAGE_VIEWS`: Optimize for people who are most likely to click on and load your chosen landing page.<br>`VISIT_INSTAGRAM_PROFILE`: Optimize for visits to the advertiser's Instagram profile.<br>`VALUE`: Optimize for maximum total purchase value within the specified attribution window.<br>`THRUPLAY`: Optimize delivery of your ads to people who are more likely to play your ad to completion, or play it for at least 15 seconds.<br>`DERIVED_EVENTS`: Optimize for retention, which reaches people who are most likely to return to the app and open it again during a given time frame after installing. You can choose either two days, meaning the app is likely to be reopened between 24 and 48 hours after installation; or seven days, meaning the app is likely to be reopened between 144 and 168 hours after installation.<br>`APP_INSTALLS_AND_OFFSITE_CONVERSIONS`: Optimizes for people more likely to install your app and make a conversion on your site. <br>`CONVERSATIONS`: Directs ads to people more likely to have a conversation with the business. |
| `optimization_sub_event`<br>string | Optimization sub event for a specific optimization goal. For example: Sound-On event for Video-View-2s optimization goal. |
| `pacing_type`<br>list<string> | Defines the pacing type, standard or using ad scheduling |
| `promoted_object`<br>[AdPromotedObject](https://developers.facebook.com/docs/marketing-api/reference/ad-promoted-object/) | The object this ad set is promoting across all its ads. |
| `recommendations`<br>list<AdRecommendation> | If there are recommendations for this ad set, this field includes them. Otherwise, will not be included in the response. This field is not included in redownload mode. |
| `recurring_budget_semantics`<br>bool | If this field is `true`, your daily spend may be more than your daily budget while your weekly spend will not exceed 7 times your daily budget. More details explained in the [Ad Set Budget](https://developers.facebook.com/docs/marketing-api/adset/budget-limits) document. If this is `false`, your amount spent daily will not exceed the daily budget. This field is not applicable for lifetime budgets. |
| `regional_regulated_categories`<br>list<enum> | This param is used to specify `regional_regulated_categories`. Currently it supports `null` and the following values:<br>1. TAIWAN\_FINSERV: Use this value to declare a Financial Service ad set if the ad targets Taiwan Audience<br>2. AUSTRALIA\_FINSERV: Use this value to declare a Financial Service ad set if the ad set targets Australia Audience<br>3. INDIA\_FINSERV: Use this value to declare a Securities and Investments ad set if the ad set targets India Audience<br>4. TAIWAN\_UNIVERSAL: Use this value to declare an ad set if it targets Taiwan Audience<br>5. SINGAPORE\_UNIVERSAL: Use this value to declare an ad set if it targets Singapore Audience<br>6. THAILAND\_UNIVERSAL: Use this value to declare an ad set if it targets Thailand Audience and you are seeing "Beneficiary/payer is missing" errors (3858634, 3858636).<br>7. BRAZIL\_REGULATION: Use this value to declare an Ad Set if it targets Thaila