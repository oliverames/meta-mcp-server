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

[LoginLoginLogin](https://business.facebook.com/business/loginpage/?is_work_accounts=true&login_options[0]=FB&login_options[1]=SSO&config_ref=biz_login_tool_flavor_dfc&app=436761779744620&next=https%3A%2F%2Fdevelopers.facebook.com%2Fdocs%2Fmarketing-api%2Freference%2Fad-campaign-group%3Fnav_ref%3Dbiz_unified_f3_login_page_to_dfc)

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

[Campaign](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#overview)

[Reading](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#Reading)

[Example](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#example)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#parameters)

[Fields](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#fields)

[Edges](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#edges)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#error-codes)

[Creating](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#Creating)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#parameters-2)

[Return Type](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#return-type)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#error-codes-2)

[Example](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#example-2)

[Updating](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#Updating)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#parameters-3)

[Return Type](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#return-type-2)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#error-codes-3)

[Deleting](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#Deleting)

[Parameters](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#parameters-4)

[Return Type](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#return-type-3)

[Error Codes](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#error-codes-4)

[Objective Validation](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#objective-validation)

[Optimization Goals](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#optimization-goals)

[Compatible Ad Types](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#compatible-ad-types)

[Objectives and Creative Fields](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#objective_creative)

[Objectives and Tracking Specs](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#objective_tracking)

[Objective and Promoted Objects](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#promoted-object)

[Objective and Placements](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#placement)

[Objective, Optimization Goal and attribution\_spec](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#attribution_spec)

[Outcome-Driven Ads Experiences Objective Validation](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#odax)

Graph API Version

[v25.0](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#)

# Campaign

A campaign is the highest level organizational structure within an ad account and should represent a single objective for an advertiser, for example, to drive page post engagement. Setting objective of the campaign will enforce validation on any ads added to the campaign to ensure they also have the correct objective.

The `date_preset = lifetime` parameter is disabled in Graph API v10.0 and replaced with `date_preset = maximum`, which returns a maximum of 37 months of data. For v9.0 and below, `date_preset = maximum` will be enabled on May 25, 2021, and any `lifetime` calls will default to `maximum` and return only 37 months of data.

### Limits

- You can only create 200 ad sets per ad campaign. [Learn more about the ad campaign structure](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group).
- If your campaign has more than 70 ad sets and uses [Campaign Budget Optimization](https://developers.facebook.com/docs/marketing-api/bidding/guides/campaign-budget-optimization), you are not able to edit your current bid strategy or turn off CBO. [Learn more in the Business Help Center](https://www.facebook.com/business/help/519856662172206).

### New Required Field for All Campaigns

All businesses using the Marketing API must identify whether or not new and edited campaigns belong to a [Special Ad Category](https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category). Current available categories are: [housing, employment, credit](https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category/#context), or issues, elections, and politics. Businesses whose ads do not belong to a Special Ad Category must indicate NONE or send an empty array in the `special_ad_categories` field.

Businesses running **housing**, **employment**, or **credit** ads must comply with [targeting and audience restrictions](https://developers.facebook.com/docs/marketing-api/audiences/reference/targeting-restrictions). Targeting for ads about social issues, elections or politics are not affected by the `special_ad_categories` label.

As of **Marketing API 7.0**, the `special_ad_category` parameter on the [`POST /act_<ad_account_id>/campaigns`](https://developers.facebook.com/docs/marketing-api/reference/ad-account/campaigns/#Creating) endpoint has been deprecated and replaced with a new `special_ad_categories` parameter. The new `special_ad_categories` parameter is required and accepts an array.

If you use the `special_ad_category` parameter, it will still return a string, but you should use `GET /{campaign-id}?fields=special_ad_categories` to get an array back. Refer to [Special Ad Category](https://developers.facebook.com/docs/marketing-api/audiences/special-ad-category/) for additional information.

## Reading

A campaign is a grouping of ad sets which are organized by the same business objective. Each campaign has an objective that must be valid across the ad sets within that campaign.

After your ads begin delivering, you can query stats for ad campaigns. The statistics returned will be unique stats, deduped across the ad sets. You can also get reports and statistics for all ad sets and ads in an campaign simultaneously.

### Example

HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDK [Graph API Explorer](https://developers.facebook.com/tools/explorer/?method=GET&path=...%3Ffields%3D%257Bfieldname_of_type_Campaign%257D&version=v25.0)

```
GET v25.0/...?fields={fieldname_of_type_Campaign} HTTP/1.1
Host: graph.facebook.com
```

```
/* PHP SDK v5.0.0 */
/* make the API call */
try {
  // Returns a `Facebook\FacebookResponse` object
  $response = $fb->get(
    '...?fields={fieldname_of_type_Campaign}',
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
    "...?fields={fieldname_of_type_Campaign}",
    function (response) {
      if (response && !response.error) {
        /* handle the result */
      }
    }
);
```

```
/* make the API call */
new GraphRequest(
    AccessToken.getCurrentAccessToken(),
    "...?fields={fieldname_of_type_Campaign}",
    null,
    HttpMethod.GET,
    new GraphRequest.Callback() {
        public void onCompleted(GraphResponse response) {
            /* handle the result */
        }
    }
).executeAsync();
```

```
/* make the API call */
FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]\
                               initWithGraphPath:@"...?fields={fieldname_of_type_Campaign}"\
                                      parameters:params\
                                      HTTPMethod:@"GET"];
[request startWithCompletionHandler:^(FBSDKGraphRequestConnection *connection,\
                                      id result,\
                                      NSError *error) {\
    // Handle the result\
}];
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
| `id`<br>numeric string | Campaign's ID<br>[Default](https://developers.facebook.com/docs/graph-api/using-graph-api/#fields) |
| `account_id`<br>numeric string | ID of the ad account that owns this campaign |
| `adlabels`<br>[list<AdLabel>](https://developers.facebook.com/docs/marketing-api/reference/ad-label/) | Ad Labels associated with this campaign |
| `bid_strategy`<br>enum {LOWEST\_COST\_WITHOUT\_CAP, LOWEST\_COST\_WITH\_BID\_CAP, COST\_CAP, LOWEST\_COST\_WITH\_MIN\_ROAS} | Bid strategy for this campaign when you enable campaign budget optimization and<br>when you use `AUCTION` as your buying type:<br>`LOWEST_COST_WITHOUT_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` without limiting your bid amount. This is the best strategy to select<br>if you care most about cost efficiency. However, note that it may be harder to get<br>stable average costs as you spend. Note: this strategy is also known as<br>_automatic bidding_.<br>Learn more in [Ads Help Center, About bid strategies: Lowest cost](https://www.facebook.com/business/help/721453268045071).<br>`LOWEST_COST_WITH_BID_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` while limiting actual bid to a specified amount.<br>Get specified bid cap in the `bid_amount` field for each ad set in this ad campaign.<br>This strategy is known as _manual maximum-cost bidding_.<br>Learn more in [Ads Help Center, About bid strategies: Lowest cost](https://www.facebook.com/business/help/721453268045071).<br>`COST_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` while limiting actual average cost per optimization event to a specified amount.<br>Get specified cost cap in the `bid_amount` field for each ad set in this ad campaign.<br>Learn more in [Ads Help Center, About bid strategies: Cost Cap](https://www.facebook.com/business/help/272336376749096?id=2196356200683573).<br>Notes:<br>- If you do not enable campaign budget optimization, you should get `bid_strategy` at the ad set level.<br>- `TARGET_COST` bidding strategy has been deprecated with [Marketing API v9](https://developers.facebook.com/docs/graph-api/changelog/version9.0). |
| `boosted_object_id`<br>numeric string | The Boosted Object this campaign has associated, if any |
| `brand_lift_studies`<br>[list<AdStudy>](https://developers.facebook.com/docs/marketing-api/reference/ad-study/) | Automated Brand Lift V2 studies for this ad set. |
| `budget_rebalance_flag`<br>bool | Whether to automatically rebalance budgets daily for all the adsets under this campaign. [This has been deprecated on Marketing API V7.0](https://developers.facebook.com/docs/graph-api/changelog/version7.0#deprecations). |
| `budget_remaining`<br>numeric string | Remaining budget |
| `buying_type`<br>string | Buying type, possible values are: <br>`AUCTION`: default<br>`RESERVED`: for [reach and frequency ads](https://developers.facebook.com/docs/marketing-api/reachandfrequency)<br>[Reach and Frequency](https://developers.facebook.com/docs/marketing-api/reachandfrequency) is disabled for [housing, employment and credit ads](https://developers.facebook.com/docs/marketing-api/special-ad-category). |
| `campaign_group_active_time`<br>numeric string | campaign\_group\_active\_time this is only for Internal, This will have the active running length of Campaign Groups |
| `can_create_brand_lift_study`<br>bool | If we can create a new automated brand lift study for the ad set. |
| `can_use_spend_cap`<br>bool | Whether the campaign can set the spend cap |
| `configured_status`<br>enum {ACTIVE, PAUSED, DELETED, ARCHIVED} | If this status is `PAUSED`, all its active ad sets and ads will<br>be paused and have an effective status `CAMPAIGN_PAUSED`. Prefer<br>using 'status' instead of this. |
| `created_time`<br>datetime | Created Time |
| `daily_budget`<br>numeric string | The daily budget of the campaign |
| `effective_status`<br>enum {ACTIVE, PAUSED, DELETED, ARCHIVED, IN\_PROCESS, WITH\_ISSUES} | IN\_PROCESS is available for version 4.0 or higher |
| `has_secondary_skadnetwork_reporting`<br>bool | has\_secondary\_skadnetwork\_reporting |
| `is_adset_budget_sharing_enabled`<br>bool | Whether the child ad sets are managed under ad set budget sharing |
| `is_budget_schedule_enabled`<br>bool | Whether budget scheduling is enabled for the campaign group |
| `is_skadnetwork_attribution`<br>bool | When set to `true` Indicates that the campaign will include SKAdNetwork, iOS 14+. |
| `issues_info`<br>[list<AdCampaignIssuesInfo>](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-issues-info/) | Issues for this campaign that prevented it from deliverying |
| `last_budget_toggling_time`<br>datetime | Last budget toggling time |
| `lifetime_budget`<br>numeric string | The lifetime budget of the campaign |
| `name`<br>string | Campaign's name |
| `objective`<br>string | Campaign's objective<br>See the [Outcome Ad-Driven Experience Objective Validation](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group#odax) section below for more information. |
| `pacing_type`<br>list<string> | Defines pacing type of the campaign. The value is an array of options: "standard". |
| `primary_attribution`<br>enum | primary\_attribution |
| `promoted_object`<br>[AdPromotedObject](https://developers.facebook.com/docs/marketing-api/reference/ad-promoted-object/) | The object this campaign is promoting across all its ads |
| `smart_promotion_type`<br>enum | Smart Promotion Type. guided\_creation or smart\_app\_promotion(the choice under APP\_INSTALLS objective). |
| `source_campaign`<br>[Campaign](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/) | The source campaign that this campaign is copied from |
| `source_campaign_id`<br>numeric string | The source campaign id that this campaign is copied from |
| `special_ad_categories`<br>list<enum> | special ad categories |
| `special_ad_category`<br>enum | The campaign's Special Ad Category. One of `HOUSING`, `EMPLOYMENT`, `CREDIT`, or `NONE`. |
| `special_ad_category_country`<br>list<enum> | Country field for Special Ad Category. |
| `spend_cap`<br>numeric string | A spend cap for the campaign, such that it will not spend more than this cap. Expressed as integer value of the subunit in your currency. |
| `start_time`<br>datetime | Merging of `start_time`s for the ad sets belonging to this campaign. At the campaign level, `start_time` is a read only field. You can setup `start_time` at the ad set level. |
| `status`<br>enum {ACTIVE, PAUSED, DELETED, ARCHIVED} | If this status is `PAUSED`, all its active ad sets and ads will<br>be paused and have an effective status `CAMPAIGN_PAUSED`. The field<br>returns the same value as 'configured\_status', and is the suggested<br>one to use. |
| `stop_time`<br>datetime | Merging of `stop_time`s for the ad sets belonging to this campaign, if available. At the campaign level, `stop_time` is a read only field. You can setup `stop_time` at the ad set level. |
| `topline_id`<br>numeric string | Topline ID |
| `updated_time`<br>datetime | Updated Time. If you update `spend_cap` or daily budget or lifetime budget, this will not automatically update this field. |

### Edges

| Edge | Description |
| --- | --- |
| [`ad_studies`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/ad_studies/)<br>Edge<AdStudy> | The ad studies containing this campaign |
| [`adrules_governed`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/adrules_governed/)<br>Edge<AdRule> | Ad rules that govern this campaign - by default, this only returns rules that either directly mention the campaign by id or indirectly through the set entity\_type |
| [`ads`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/ads/)<br>Edge<Adgroup> | Ads under this campaign |
| [`adsets`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/adsets/)<br>Edge<AdCampaign> | The ad sets under this campaign |
| [`copies`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/copies/)<br>Edge<AdCampaignGroup> | The copies of this campaign |

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 80004 | There have been too many calls to this ad-account. Wait a bit and try again. For more info, please refer to https://developers.facebook.com/docs/graph-api/overview/rate-limiting#ads-management. |
| 613 | Calls to this api have exceeded the rate limit. |
| 190 | Invalid OAuth 2.0 Access Token |
| 104 | Incorrect signature |
| 2500 | Error parsing graph query |
| 3018 | The start date of the time range cannot be beyond 37 months from the current date |
| 200 | Permissions error |
| 2635 | You are calling a deprecated version of the Ads API. Please update to the latest version. |

## Creating

You can make a POST request to `async_batch_requests` edge from the following paths:

- [`/act_{ad_account_id}/async_batch_requests`](https://developers.facebook.com/docs/marketing-api/reference/ad-account/async_batch_requests/)

When posting to this edge, a [Campaign](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `adbatch`<br>list<Object> | JSON encoded batch reqeust<br>Required |
| `name`<br>string | Required |
| `relative_url`<br>string | Required |
| `body`<br>UTF-8 encoded string | Required |
| `name`<br>UTF-8 encoded string | Name of the batch request for tracking purposes.<br>Required |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node represented by `id` in the return type.

Struct {

`id`: numeric string,

}

### Error Codes

| Error | Description |
| --- | --- |
| 194 | Missing at least one required parameter |
| 100 | Invalid parameter |
| 2500 | Error parsing graph query |

You can make a POST request to `copies` edge from the following paths:

- [`/{campaign_id}/copies`](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/copies/)

When posting to this edge, a [Campaign](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/) will be created.

### Parameters

| Parameter | Description |
| --- | --- |
| `deep_copy`<br>boolean | Default value: `false`<br>Whether to copy all the child ads. Limits: the total number of children ads to copy should not exceed 3 for a synchronous call and 51 for an asynchronous call. |
| `end_time`<br>datetime | For deep copy, the end time of the sets under the copied campaign, e.g. `2015-03-12 23:59:59-07:00` or `2015-03-12 23:59:59 PDT`. UTC UNIX timestamp. When creating a set with a daily budget, specify `end_time=0` to set the set to be ongoing without end date. If not set, the copied sets will inherit the end time from the original set |
| `parameter_overrides`<br>Campaign spec | parameter\_overrides |
| `rename_options`<br>JSON or object-like arrays | Rename options |
| `rename_strategy`<br>enum {DEEP\_RENAME, ONLY\_TOP\_LEVEL\_RENAME, NO\_RENAME} | Default value: `ONLY_TOP_LEVEL_RENAME`<br>`DEEP_RENAME`: will change this object's name and children's names in the copied object. `ONLY_TOP_LEVEL_RENAME`: will change the this object's name but won't change the children's name in the copied object. `NO_RENAME`: will change no name in the copied object |
| `rename_prefix`<br>string | A prefix to copy names. Defaults to null if not provided. |
| `rename_suffix`<br>string | A suffix to copy names. Defaults to null if not provided and appends a localized string of `- Copy` based on the ad account locale. |
| `start_time`<br>datetime | For deep copy, the start time of the sets under the copied campaign, e.g. `2015-03-12 23:59:59-07:00` or `2015-03-12 23:59:59 PDT`. UTC UNIX timestamp. If not set, the copied sets will inherit the start time from the original set |
| `status_option`<br>enum {ACTIVE, PAUSED, INHERITED\_FROM\_SOURCE} | Default value: `PAUSED`<br>`ACTIVE`: the copied campaign will have active status. `PAUSED`: the copied campaign will have paused status. `INHERITED_FROM_SOURCE`: the copied campaign will have the parent status. |

### Return Type

This endpoint supports [read-after-write](https://developers.facebook.com/docs/graph-api/overview/#read-after-write) and will read the node represented by `copied_campaign_id` in the return type.

Struct {

`copied_campaign_id`: numeric string,

`ad_object_ids`: List \[\
\
Struct {\
\
`ad_object_type`: enum {unique\_adcreative, ad, ad\_set, campaign, opportunities, privacy\_info\_center, topline, ad\_account, product},\
\
`source_id`: numeric string,\
\
`copied_id`: numeric string,\
\
}\
\
\],

}

### Error Codes

| Error | Description |
| --- | --- |
| 100 | Invalid parameter |
| 190 | Invalid OAuth 2.0 Access Token |
| 200 | Permissions error |

You can make a POST request to `campaigns` edge from the following paths:

- [`/act_{ad_account_id}/campaigns`](https://developers.facebook.com/docs/marketing-api/reference/ad-account/campaigns/)

When posting to this edge, a [Campaign](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/) will be created.

### Example

HTTPPHP SDKJavaScript SDKAndroid SDKiOS SDKcURL [Graph API Explorer](https://developers.facebook.com/tools/explorer/?method=POST&path=act_%3CAD_ACCOUNT_ID%3E%2Fcampaigns%3Fname%3DMy%2Bcampaign%26objective%3DOUTCOME_TRAFFIC%26status%3DPAUSED%26special_ad_categories%3D%255B%255D%26is_adset_budget_sharing_enabled%3D0&version=v25.0)

```
POST /v25.0/act_<AD_ACCOUNT_ID>/campaigns HTTP/1.1
Host: graph.facebook.com

name=My+campaign&objective=OUTCOME_TRAFFIC&status=PAUSED&special_ad_categories=%5B%5D&is_adset_budget_sharing_enabled=0
```

```
/* PHP SDK v5.0.0 */
/* make the API call */
try {
  // Returns a `Facebook\FacebookResponse` object
  $response = $fb->post(
    '/act_<AD_ACCOUNT_ID>/campaigns',
    array (
      'name' => 'My campaign',
      'objective' => 'OUTCOME_TRAFFIC',
      'status' => 'PAUSED',
      'special_ad_categories' => '[]',
      'is_adset_budget_sharing_enabled' => '0',
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
    "/act_<AD_ACCOUNT_ID>/campaigns",
    "POST",
    {
        "name": "My campaign",
        "objective": "OUTCOME_TRAFFIC",
        "status": "PAUSED",
        "special_ad_categories": "[]",
        "is_adset_budget_sharing_enabled": "0"
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
params.putString("name", "My campaign");
params.putString("objective", "OUTCOME_TRAFFIC");
params.putString("status", "PAUSED");
params.putString("special_ad_categories", "[]");
params.putString("is_adset_budget_sharing_enabled", "0");
/* make the API call */
new GraphRequest(
    AccessToken.getCurrentAccessToken(),
    "/act_<AD_ACCOUNT_ID>/campaigns",
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
  @"name": @"My campaign",
  @"objective": @"OUTCOME_TRAFFIC",
  @"status": @"PAUSED",
  @"special_ad_categories": @"[]",
  @"is_adset_budget_sharing_enabled": @"0",
};
/* make the API call */
FBSDKGraphRequest *request = [[FBSDKGraphRequest alloc]\
                               initWithGraphPath:@"/act_<AD_ACCOUNT_ID>/campaigns"\
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
  -F 'name="My campaign"' \
  -F 'objective="OUTCOME_TRAFFIC"' \
  -F 'status="PAUSED"' \
  -F 'special_ad_categories=[]' \
  -F 'is_adset_budget_sharing_enabled=0' \
  -F 'access_token=<ACCESS_TOKEN>' \
  https://graph.facebook.com/v25.0/act_<AD_ACCOUNT_ID>/campaigns
```

If you want to learn how to use the Graph API, read our [Using Graph API guide](https://developers.facebook.com/docs/graph-api/using-graph-api/).

### Parameters

| Parameter | Description |
| --- | --- |
| `adlabels`<br>list<Object> | [Ad Labels](https://developers.facebook.com/docs/marketing-api/reference/ad-label) associated with this campaign |
| `bid_strategy`<br>enum{LOWEST\_COST\_WITHOUT\_CAP, LOWEST\_COST\_WITH\_BID\_CAP, COST\_CAP, LOWEST\_COST\_WITH\_MIN\_ROAS} | Choose bid strategy for this campaign to suit your specific business goals.<br>Each strategy has tradeoffs and may be available for certain `optimization_goal`s:<br>`LOWEST_COST_WITHOUT_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` without limiting your bid amount. This is the best strategy<br>if you care most about cost efficiency. However with this strategy it may be harder to get<br>stable average costs as you spend. This strategy is also known as _automatic bidding_.<br>Learn more in [Ads Help Center, About bid strategies: Lowest cost](https://www.facebook.com/business/help/721453268045071).<br>`LOWEST_COST_WITH_BID_CAP`: Designed to get the most results for your budget based on<br>your ad set `optimization_goal` while limiting actual bid to your specified<br>amount. With a bid cap you have more control over your<br>cost per actual optimization event. However if you set a limit which is too low you may<br>get less ads delivery. If you select this, you must provide<br>a bid cap in the `bid_amount` field for each ad set in this ad campaign.<br>Note: during creation this is the default bid strategy if you don't specify.<br>This strategy is also known as _manual maximum-cost bidding_.<br>Learn more in [Ads Help Center, About bid strategies: Lowest cost](https://www.facebook.com/business/help/721453268045071).<br>**Notes:**<br>- If you do not enable campaign budget optimization, you should set `bid_strategy` at ad set level.<br>- `TARGET_COST` bidding strategy has been deprecated with [Marketing API v9](https://developers.facebook.com/docs/graph-api/changelog/version9.0). |
| `budget_schedule_specs`<br>list<JSON or object-like arrays> | Initial high demand periods to be created with the campaign.<br>Provide list of `time_start`, `time_end`,`budget_value`, and `budget_value_type`.<br>For example,<br>-F 'budget\_schedule\_specs=\[{<br>"time\_start":1699081200,<br>"time\_end":1699167600,<br>"budget\_value":100,<br>"budget\_value\_type":"ABSOLUTE"<br>}\]'<br>See [High Demand Period](https://developers.facebook.com/docs/graph-api/reference/high-demand-period/) for more details on each field. |
| `id`<br>int64 |  |
| `time_start`<br>datetime |  |
| `time_end`<br>datetime |  |
| `budget_value`<br>int64 |  |
| `budget_value_type`<br>enum{ABSOLUTE, MULTIPLIER} |  |
| `recurrence_type`<br>enum{ONE\_TIME, WEEKLY} |  |
| `weekly_schedule`<br>list<JSON or object-like arrays> |  |
| `days`<br>list<int64> |  |
| `minute_start`<br>int64 |  |
| `minute_end`<br>int64 |  |
| `timezone_type`<br>string |  |
| `buying_type`<br>string | Default value: `AUCTION`<br>This field will help Facebook make optimizations to delivery, pricing, and limits. All ad sets in this campaign must match the buying type. Possible values are: <br>`AUCTION` (default)<br>`RESERVED` (for [reach and frequency ads](https://developers.facebook.com/docs/marketing-api/reachandfrequency)). |
| `campaign_optimization_type`<br>enum{NONE, ICO\_ONLY} | campaign\_optimization\_type |
| `daily_budget`<br>int64 | Daily budget of this campaign. All adsets under this<br>campaign will share this budget. You can either set budget at the<br>campaign level or at the adset level, not both. |
| `execution_options`<br>list<enum{validate\_only, include\_recommendations}> | Default value: `Set`<br>An execution setting<br>`validate_only`: when this option is specified, the API call will not perform the mutation but will run through the validation rules against values of each field. <br>`include_recommendations`: this option cannot be used by itself. When this option is used, recommendations for ad object's configuration will be included. A separate section [recommendations](https://developers.facebook.com/docs/marketing-api/reference/ad-recommendation) will be included in the response, but only if recommendations for this specification exist.<br>If the call passes validation or review, response will be `{"success": true}`. If the call does not pass, an error will be returned with more details. These options can be used to improve any UI to display errors to the user much sooner, e.g. as soon as a new value is typed into any field corresponding to this ad object, rather than at the upload/save stage, or after review. |
| `is_skadnetwork_attribution`<br>boolean | To create an iOS 14 campaign, enable SKAdNetwork attribution for this campaign. |
| `is_using_l3_schedule`<br>boolean | is\_using\_l3\_schedule |
| `iterative_split_test_configs`<br>list<Object> | Array of Iterative Split Test Configs created under this campaign . |
| `lifetime_budget`<br>int64 | Lifetime budget of this campaign. All adsets under<br>this campaign will share this budget. You can either set budget at the<br>campaign level or at the adset level, not both. |
| `name`<br>string | Name for this campaign<br>Supports Emoji |
| `objective`<br>enum{APP\_INSTALLS, BRAND\_AWARENESS, CONVERSIONS, EVENT\_RESPONSES, LEAD\_GENERATION, LINK\_CLICKS, LOCAL\_AWARENESS, MESSAGES, OFFER\_CLAIMS, OUTCOME\_APP\_PROMOTION, OUTCOME\_AWARENESS, OUTCOME\_ENGAGEMENT, OUTCOME\_LEADS, OUTCOME\_SALES, OUTCOME\_TRAFFIC, PAGE\_LIKES, POST\_ENGAGEMENT, PRODUCT\_CATALOG\_SALES, REACH, STORE\_VISITS, VIDEO\_VIEWS} | Campaign's objective. If it is specified the API will validate that any ads created under the campaign match that objective. <br>Currently, with `BRAND_AWARENESS` objective, all creatives should be either only images or only videos, not mixed.<br>See [Outcome Ad-Driven Experience Objective Validation](https://developers.facebook.com/docs/marketing-api/reference/ad-campaign-group/#odax) for more information. |
| `promoted_object`<br>Object | The object this campaign is promoting across all its ads. It’s required for Meta iOS 14+ app promotion (SKAdNetwork or Aggregated Event Measurement) campaign creation. Only `product_catalog_id` is used at the ad set level. |
| `application_id`<br>int | The ID of a Facebook Application. Usually related to mobile or canvas games being promoted on Facebook for installs or engagement |
| `pixel_id`<br>numeric string or integer | The ID of a Facebook conversion pixel. Used with offsite conversion campaigns. |
| `custom_event_type`<br>enum{AD\_IMPRESSION, RATE, TUTORIAL\_COMPLETION, CONTACT, CUSTOMIZE\_PRODUCT, DONATE, FIND\_LOCATION, SCHEDULE, START\_TRIAL, SUBMIT\_APPLICATION, SUBSCRIBE, ADD\_TO\_CART, ADD\_TO\_WISHLIST, INITIATED\_CHECKOUT, ADD\_PAYMENT\_INFO, PURCHASE, LEAD, COMPLETE\_REGISTRATION, CONTENT\_VIEW, SEARCH, SERVICE\_BOOKING\_REQUEST, MESSAGING\_CONVERSATION\_STARTED\_7D, LEVEL\_ACHIEVED, ACHIEVEMENT\_UNLOCKED, SPENT\_CREDITS, LISTING\_INTERACTION, D2\_RETENTION, D7\_RETENTION, OTHER} | The event from an App Event of a mobile app,<br>not in the standard event list. |
| `object_store_url`<br>URL | The uri of the mobile / digital store where an application can be bought / downloaded. This is platform specific. When combined with the "application\_id" this uniquely specifies an object which can be the subject of a Facebook advertising campaign. |
| `object_store_urls`<br>list<URL> | The vec of uri of the mobile / digital store where an application can be bought / downloaded. This is platform specific. When combined with the "application\_id" this uniquely specifies an object which can be the subject of a Facebook advertising campaign. |
| `offer_id`<br>numeric string or integer | The ID of an Offer from a Facebook Page. |
| `page_id`<br>Page ID | The ID of a Facebook Page |
| `product_catalog_id`<br>numeric string or integer | The ID of a Product Catalog. Used with<br>[Dynamic Product Ads](https://developers.facebook.com/docs/marketing-api/dynamic-product-ads). |
| `product_item_id`<br>numeric string or integer | The ID of the product item. |
| `instagram_profile_id`<br>numeric string or integer | The ID of the instagram profile id. |
| `product_set_id`<br>numeric string or integer | The ID of a Product Set within an Ad Set level Product<br>Catalog. Used with<br>[Dynamic Product Ads](https://developers.facebook.com/docs/marketing-api/dynamic-product-ads). |
| `event_id`<br>numeric string or integer | The ID of a Facebook Event |
| `offline_conversion_data_set_id`<br>numeric string or integer | The ID of the offline dataset. |
| `fundraiser_campaign_id`<br>numeric string or integer | The ID of the fundraiser campaign. |
| `custom_event_str`<br>string | The event from an App Event of a mobile app,<br>not in the standard event list. |
| `mcme_conversion_id`<br>numeric string or integer | The ID of a MCME conversion. |
| `conversion_goal_id`<br>numeric string or integer | The ID of a Conversion Goal. |
| `offsite_conversion_event_id`<br>numeric string or integer | The ID of a Offsite Conversion Event |
| `boosted_product_set_id`<br>numeric string or integer | The ID of the Boosted Product Set within an Ad Set level Product<br>Catalog. Should only be present when the advertiser has<br>opted into Product Set Boosting. |
| `lead_ads_form_event_source_type`<br>enum{inferred, meta\_source, offsite\_crm, offsite\_web, onsite\_crm, onsite\_crm\_single\_event, onsite\_clo\_dep\_aet, onsite\_web, onsite\_p2b\_call, onsite\_messaging} | The event source of lead ads form. |
| `lead_ads_custom_event_type`<br>enum{AD\_IMPRESSION, RATE, TUTORIAL\_COMPLETION, CONTACT, CUSTOMIZE\_PRODUCT, DONATE, FIND\_LOCATION, SCHEDULE, START\_TRIAL, SUBMIT\_APPLICATION, SUBSCRIBE, ADD\_TO\_CART, ADD\_TO\_WISHLIST, INITIATED\_CHECKOUT, ADD\_PAYMENT\_INFO, PURCHASE, LEAD, COMPLETE\_REGISTRATION, CONTENT\_VIEW, SEARCH, SERVICE\_BOOKING\_REQUEST, MESSAGING\_CONVERSATION\_STARTED\_7D, LEVEL\_ACHIEVED, ACHIEVEMENT\_UNLOCKED, SPENT\_CREDITS, LISTING\_INTERACTION, D2\_RETENTION, D7\_RETENTION, OTHER} | The event from an App Event of a mobile app,<br>not in the standard event list. |
| `lead_ads_custom_event_str`<br>string | The event from an App Event of a mobile app,<br>not in the standard event list. |
| `lead_ads_offsite_conversion_type`<br>enum{default, clo} | The offsite conversion type for lead ads |
| `value_semantic_type`<br>enum {VALUE, MARGIN, LIFETIME\_VALUE} | The semantic of the event value to be using for optimization |
| `variation`<br>enum {OMNI\_CHANNEL\_SHOP\_AUTOMATIC\_DATA\_COLLECTION, PRODUCT\_SET\_AND\_APP, PRODUCT\_SET\_AND\_IN\_STORE, PRODUCT\_SET\_AND\_OMNICHANNEL, PRODUCT\_SET\_AND\_PHONE\_CALL, PRODUCT\_SET\_A