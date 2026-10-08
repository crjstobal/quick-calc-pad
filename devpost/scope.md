---
doc: scope
status: approved
---

# Quick Calc Pad

A notepad-style calculator on a web page: type calculations in plain language, line by line, and see the answers right away.

## The Unique Kernel
Percentages written the way people say them ("20% off 80", "VAT 21% on 150"), with results you can name and reuse on later lines. Templates turn common jobs like VAT into "load it and change the numbers."

## Who It's For
Anyone who needs a quick percentage answer, such as a discount, a VAT amount, or a price with tax, and doesn't want to do several steps on a calculator or ask an AI. Today they tap through a phone calculator, guess, or open a chatbot.

## The Core Loop
Open the page (no account, nothing to set up) and start typing. Each line shows its result. Later lines build on earlier ones. When the task is a common one, press a template button, and the lines load ready to edit, so you only change the numbers.

## Inspiration & Identity
- Soulver (https://soulver.app): plain-language lines, answers in a column, lines that refer to each other.
- Feel: instant. "Enter and start typing."

## Why This Matters to the Learner
They want something people can "use quickly on a website," and they want to practice defining an MVP "so I don't keep adding features over and over and never ship."

## What "Working" Looks Like
A blank page opens. The user types a few calculations and sees the results appear. Then they press a button, the VAT template loads, and they change the numbers to get their answer quickly. The moment that sells it: the template fills in and every result updates as soon as a number changes.

## The POC Boundary
- Typing calculation lines with results shown right away: percentages, discounts, VAT, and general math (brackets, powers, and similar)
- Naming results so later lines can reuse them
- A VAT template button, plus a few more templates (such as discounts)
- Saving the page in the browser so it's still there next time, with no account

## Later
- Currencies and anything else that needs live outside data, because they require an API.

## Explicitly Cut
- Accounts and logins: the point is "no username no nothing, just enter and start typing."
