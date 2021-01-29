import requests
import re

from requests_html import HTMLSession
session = HTMLSession()

paths = [
#   'https://github.com/airladon/FigureOne/tree/master',
  'https://github.com/airladon/FigureOne/tree/master/docs/examples',
  'https://github.com/airladon/FigureOne/tree/master/docs/tutorials',
]

api_reference = session.get('https://airladon.github.io/FigureOne/api/')


def check_api(api_path: str):
    api_id = re.search('#(.*)$', api_path).group(1)
    check = api_reference.html.find(f'#{api_id}')
    if (check):
        return True
    return False


for path in paths:
    r = session.get(path)
    links = r.html.find('#readme', first=True).absolute_links
    failed = []
    print()
    print(f'Testing: {path}')
    for link in links:
        link_r = requests.get(link)
        if link_r.status_code != 200:
            failed.append(link)
            print(f'  FAILED: {link}')
        else:
            print(f'  OK: {link}')

    if len(failed) > 0:
        print()
        print(f'Links failed at: {path}')
        for failed_link in failed:
            print(f'  {failed_link}')
    
    folders = r.html.find('.js-active-navigation-container', first=True).absolute_links


test_r = requests.get("https://airladon.github.io/FigureOne/api/#obj_rectangle")


r = session.get('https://github.com/airladon/FigureOne/tree/master/docs/tutorials')

folders = r.html.find('.js-details-container')