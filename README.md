## This is a repo to automatically make Blink Fitness reservations
It relies on on a `usercredentials.json` file which contains the login details for the users to make reservations for.
These details reflect the accounts you want to create reservations for. An example of which is below.

## usercredentials.json format
```
[
    {
        "name": "John Smith",
        "businessUnitCode": 628,
        "reservations": { "1": "08:50:00", "3": "08:50:00", "5": "08:50:00"},
        "loginDetails": {"authType":"zip","userId":"USER_ID","password":"ZIP_CODE"}
    },
    {
        "name": "Sarah Smith",
        "businessUnitCode": 628,
        "reservations": { "1": "08:50:00", "3": "08:50:00", "5": "08:50:00"},
        "loginDetails": {"authType":"zip","userId":"USER_ID","password":"ZIP_CODE"}
    }
]
```
`reservations`: The keys within the reservations object are the days of the week with Sunday being 0, Monday being 1 etc. The value is the time slot. This can be extended to an array of time slots, but currently only supports one slot per day.
`businessUnitCode`: Is the ID of the blink you'd like to reserve at. This can probaly be retrieved automatically from the login object, but currently this is specified manually.
`loginDetails`: I believe that the default when signing up to blink is authentication via userId & zip code.

## Running
`git clone`
`yarn install`
`yarn run reserve`

## Scheduling
This script is designed to be run once a day, so that any reservations that can be made will be made.
Blink currently only allows reservations 2 days in the future, so scheduling once a day at just after midnight should be fine.

You make modifications to your cron jobs like so:

`crontab -e`

Adding the following line will execute the script every day at 3am.
```
PATH=/bin:/usr/local/bin
0 3 * * *  cd ~/DIR_WHERE_YOU_CLONE/blinkschedule && yarn run reserve
```

## Output
You will see output from the script in the console as well as within `default.log`.
N.B. the timestamps are in UTC.




