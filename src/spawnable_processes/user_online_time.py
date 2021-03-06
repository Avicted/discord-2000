import sys
import json
import os
from datetime import datetime as dt, timedelta, date
import datetime
import plotly as plotly
import pandas as pd
import numpy as np
import psycopg2

class HiddenPrints:
    def __enter__(self):
        self._original_stdout = sys.stdout
        sys.stdout = open(os.devnull, 'w')

    def __exit__(self, exc_type, exc_val, exc_tb):
        sys.stdout = self._original_stdout


def daterange(start_date, end_date):
    for n in range(int((end_date - start_date).days + 1)):
        yield start_date + timedelta(n)


def datetime_diff_to_hours(disconnected_at, connected_at):
    user_connected_time = disconnected_at - connected_at
    total_seconds = user_connected_time.total_seconds()
    hours = total_seconds//3600
    minutes = ((total_seconds%3600) // 60) / 60     # format 35 minutes = 0.5833
    total_hours = round(hours + minutes, 2)
    return total_hours


def generate_chart(data, input_user_id):
    figure = plotly.graph_objects.Figure(data=[plotly.graph_objects.Bar(
            x=data['date'],
            y=data['total_hours_online'],
    )])

    figure.layout.template = 'plotly_dark'
    timestamp = dt.now().strftime("%Y-%m-%d-%H-%M-%S")
    
    if input_user_id is not None:
        chart_filename = f"total_hours_online_{input_user_id}_{timestamp}.jpeg"
        title = "Your online hours per day this year"
    else: 
        title = "Total hours online per day (all users) this year"
        chart_filename = f"total_hours_online_{timestamp}.jpeg"

    figure.update_layout(
        xaxis_rangeslider_visible=False,
        width=1280,
        height=720,
        title=title
    )

    figure.write_image(chart_filename)    
    return chart_filename


def main():
    with HiddenPrints():
        database_settings = {
            "host": os.environ['POSTGRES_HOST'],
            "database": os.environ['POSTGRES_DB'],
            "user": os.environ['POSTGRES_USER'],
            "password": os.environ['POSTGRES_PASSWORD']
        }


        # connect to the database
        try:
            conn = psycopg2.connect("dbname=%s user=%s host=%s password=%s" % (
                    database_settings['database'],
                    database_settings['user'],
                    database_settings['host'],
                    database_settings['password']
                )
            )
        except:
            print("Unable to connect to the database")


        cur = conn.cursor()

        
        input_user_id = None

        if len(sys.argv) > 1:
            input_data = json.loads(sys.argv[1])
            input_user_id = input_data[0]['user_id']

        try:
            if input_user_id is not None:
                cur.execute("""SELECT 
                    user_presence.id, 
                    user_presence.action, 
                    user_presence."createdAt", 
                    user_presence."updatedAt", 
                    user_presence."userId", 
                    user_presence."newVoiceChannelId"
                    FROM public.user_presence AS user_presence
                    LEFT JOIN public.user AS u
                    ON user_presence."userId" = u.Id
                    WHERE date_part('year', user_presence."createdAt") >= date_part('year', CURRENT_DATE)
                    AND "action" != 'CHANGED_VOICE_CHANNEL'
                    AND u."isBot" = false
                    AND u."id" = '%s'
                    ORDER BY "id";""" % (input_user_id))
            else:
                cur.execute("""SELECT 
                    user_presence.id, 
                    user_presence.action, 
                    user_presence."createdAt", 
                    user_presence."updatedAt", 
                    user_presence."userId", 
                    user_presence."newVoiceChannelId"
                    FROM public.user_presence AS user_presence
                    LEFT JOIN public.user AS u
                    ON user_presence."userId" = u.Id
                    WHERE date_part('year', user_presence."createdAt") >= date_part('year', CURRENT_DATE)
                    AND "action" != 'CHANGED_VOICE_CHANNEL'
                    AND u."isBot" = false
                    ORDER BY "id";""")
        except:
            print("Error selecting from the database")

        rows = cur.fetchall()
        start_date = None
        end_date = dt.now().date()
        start_date = rows[0][2].date() # set the start_date to the earliest database entry
        hours_online_per_day = pd.DataFrame(columns=['date', 'total_hours_online'])
        index = 0

        
        # for every date this year so far
        for single_date in daterange(start_date, end_date):
            # reset every day
            user_state = {}
            total_hours_per_day = 0

            # and every user presence entry on a single date
            for row in rows:
                action = row[1]
                created_at = row[2]
                user_id = row[4]

                if created_at.date() != single_date:
                    continue

                if action == 'JOINED':
                    if user_id in user_state:
                        if user_state[user_id]["action"] == 'JOINED':
                            continue

                    user_state[user_id] = {
                        "action": "JOINED",
                        "datetime": created_at
                    }

                if action == 'DISCONNECTED':
                    if user_id in user_state:
                        if user_state[user_id]["action"] == 'JOINED':
                            # calculate the time diff between disconnect and connect
                            connected_at = user_state[user_id]["datetime"]
                            disconnected_at = created_at
                            total_hours = datetime_diff_to_hours(disconnected_at, connected_at)
                            total_hours_per_day = total_hours_per_day + total_hours

                            # Update the users state
                            user_state[user_id] = {
                                "action": "DISCONNECTED",
                                "datetime": created_at
                            }
                    else:
                        # Update the users state
                        user_state[user_id] = {
                            "action": "DISCONNECTED",
                            "datetime": created_at
                        }

                        # the user has connected the day before, they disconnected on this day
                        disconnected_at = user_state[user_id]["datetime"]
                        connected_at = dt.combine(disconnected_at, datetime.time.min)
                        total_hours = datetime_diff_to_hours(disconnected_at, connected_at)
                        print(total_hours)
                        total_hours_per_day = total_hours_per_day + total_hours


            # Handle users that never disconnected before 00:00 on this date
            # Their online time is added to the total_hours_per_day
            for user_id in user_state:
                if user_state[user_id]["action"] == 'JOINED':
                    connected_at = user_state[user_id]["datetime"]

                    if single_date == date.today():
                        disconnected_at = dt.combine(connected_at, datetime.datetime.now().time())
                    else:
                        disconnected_at = dt.combine(connected_at, datetime.time.max)

                    total_hours = datetime_diff_to_hours(disconnected_at, connected_at)
                    total_hours_per_day = total_hours_per_day + total_hours
            
            hours_online_per_day.loc[index] = [single_date, total_hours_per_day]
            index = index + 1


    # print(hours_online_per_day)

    chart_filename = generate_chart(hours_online_per_day, input_user_id)
    print(chart_filename)

    sys.stdout.flush()
    os._exit(os.EX_OK)


if __name__ == "__main__":
    main()
