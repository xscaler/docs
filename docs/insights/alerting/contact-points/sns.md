---
id: sns
title: Amazon SNS
sidebar_label: Amazon SNS
slug: /insights/alerting/contact-points/sns
---

# Amazon SNS

SNS is the integration to reach when alerts have to fan out inside AWS: a
Lambda, an SQS queue, SMS, or several of them from one publish.

## 1. Create the topic

```bash
aws sns create-topic --name xscaler-alerts
```

Note the topic ARN it returns, for example
`arn:aws:sns:eu-west-1:123456789012:xscaler-alerts`.

Subscribe whatever should receive the alerts:

```bash
aws sns subscribe \
  --topic-arn arn:aws:sns:eu-west-1:123456789012:xscaler-alerts \
  --protocol lambda \
  --notification-endpoint arn:aws:lambda:eu-west-1:123456789012:function:handle-alert
```

## 2. Create an IAM user for publishing

xScaler publishes with static credentials, so create a user whose only
permission is publishing to that topic.

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": "sns:Publish",
      "Resource": "arn:aws:sns:eu-west-1:123456789012:xscaler-alerts"
    }
  ]
}
```

Create an access key for the user and keep both halves to hand.

Scope the policy to the one topic ARN. A wildcard resource turns an alerting
credential into a publish-anywhere credential.

## 3. Create the contact point

**Insights → Alerting → Contact points → New contact point**, type
**Amazon SNS**.

| Field | Notes |
|-------|-------|
| Topic ARN | The full ARN of the topic |
| Region | The topic's region, for example `eu-west-1` |
| Access key | The IAM user's access key ID |
| Secret key | The IAM user's secret access key |

Then **Test**.

Both credential fields go together. Supplying one without the other is
rejected.

## What is published

| Part | Content |
|------|---------|
| Subject | The first alert's summary annotation, falling back to the rule name. Trimmed to 100 characters |
| Message | The alert list with each alert's labels |

A FIFO topic, whose ARN ends in `.fifo`, gets the notification group's identity
as both the message group ID and the deduplication ID, so ordering and
deduplication work without extra configuration.

Where a message is trimmed to fit SNS's limits, the published message carries a
`truncated` attribute so the receiving end can tell.

## Common failures

| Delivery attempt says | Cause |
|-----------------------|-------|
| `AuthorizationError` | The IAM policy does not allow `sns:Publish` on this topic |
| `InvalidClientTokenId` | The access key is wrong or was deactivated |
| `SignatureDoesNotMatch` | The secret key is wrong |
| `NotFound`, `InvalidParameter` | The topic ARN is wrong, or its region does not match the Region field |
| `region is not configured` | The Region field is empty |
| `must specify both access key and secret key` | Only one of the two is filled in |
| Published, nothing happened | The topic has no subscriptions, or a subscription is unconfirmed. Check the topic in the AWS console |

`aws sns publish` with the same credentials is the quickest way to separate an
IAM problem from a topic problem.
