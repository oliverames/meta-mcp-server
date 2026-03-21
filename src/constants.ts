export const GRAPH_API_VERSION = "v21.0";
export const GRAPH_API_BASE = `https://graph.facebook.com/${GRAPH_API_VERSION}`;
export const CHARACTER_LIMIT = 25000;

export const PAGE_FIELDS =
  "id,name,category,fan_count,followers_count,link,description,about,access_token,instagram_business_account";

export const POST_FIELDS =
  "id,message,story,created_time,full_picture,permalink_url,from,attachments";

export const IG_ACCOUNT_FIELDS =
  "id,username,name,biography,followers_count,follows_count,media_count,profile_picture_url,website";

export const IG_MEDIA_FIELDS =
  "id,media_type,media_product_type,media_url,thumbnail_url,permalink,caption,like_count,comments_count,timestamp";

export const CAMPAIGN_FIELDS =
  "id,name,objective,status,effective_status,budget_remaining,daily_budget,lifetime_budget,start_time,stop_time,created_time,updated_time";

export const ADSET_FIELDS =
  "id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,budget_remaining,billing_event,optimization_goal,start_time,end_time,targeting,created_time";

export const AD_FIELDS =
  "id,name,adset_id,campaign_id,status,effective_status,creative,created_time,updated_time,preview_shareable_link";

export const CREATIVE_FIELDS =
  "id,name,title,body,image_url,object_story_id,object_type,status";

export const AUDIENCE_FIELDS =
  "id,name,description,subtype,approximate_count_lower_bound,approximate_count_upper_bound,time_created,delivery_status,operation_status";

export const AD_ACCOUNT_FIELDS =
  "id,name,account_id,account_status,currency,timezone_name,spend_cap,amount_spent,balance,business";

export const INSIGHT_FIELDS =
  "impressions,reach,clicks,spend,cpm,cpc,cpp,ctr,frequency,unique_clicks,unique_impressions,actions,cost_per_action_type,conversions,conversion_values,cost_per_conversion,purchase_roas,inline_link_clicks,inline_link_click_ctr,cost_per_inline_link_click,inline_post_engagement,outbound_clicks,outbound_clicks_ctr,cost_per_outbound_click,social_spend,video_play_actions,video_avg_time_watched_actions,video_p25_watched_actions,video_p50_watched_actions,video_p75_watched_actions,video_p95_watched_actions,video_p100_watched_actions,video_thruplay_watched_actions,cost_per_thruplay,quality_ranking,engagement_rate_ranking,conversion_rate_ranking,date_start,date_stop";

export const THREADS_API_BASE = "https://graph.threads.net/v1.0";

export const THREADS_PROFILE_FIELDS =
  "id,username,name,threads_profile_picture_url,threads_biography";

export const THREADS_MEDIA_FIELDS =
  "id,media_product_type,media_type,media_url,permalink,username,text,timestamp,shortcode,thumbnail_url,children,is_quote_post,reply_audience";

export const AD_LIBRARY_FIELDS =
  "id,ad_creation_time,ad_creative_bodies,ad_creative_link_captions,ad_creative_link_descriptions,ad_creative_link_titles,ad_delivery_start_time,ad_delivery_stop_time,ad_snapshot_url,bylines,currency,delivery_by_region,demographic_distribution,estimated_audience_size,impressions,languages,page_id,page_name,publisher_platforms,spend,target_ages,target_gender,target_locations";
