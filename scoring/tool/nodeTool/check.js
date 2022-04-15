const axios = require('axios');
const fs = require('fs');


const debug = true;

const mylog = (m) => {
    if (!debug) {
        return;
    }
    console.log(m);
}

let fallback = false;
mylog(process.argv);
if (process.argv !== undefined && process.argv.length > 2 && process.argv[2] === 'fallback') {
    fallback = true;
}

let hostName;
let target;
if (!fallback) {
    hostName = fs.readFileSync("/etc/hostname", "utf-8");
    target = `https://${hostName.trim()}.ftt2204.dabaas.net/api/client/`;
} else {
    target = 'http://127.0.0.1:8080/api/client/'
}

const result = {};
let hasError = false;
const resultFilePath = './result/check.dat';
const warnFilePath = './result/check_warn.dat';

const testKey1 = 'nitro';
const testKey2 = 'dol';
const testUserName1 = 'ds';
const testUserName2 = 'cube';
const testGroupName1 = '2004'
const testGroupName2 = '2001';

const img1 = {"name": "p.png","data": "iVBORw0KGgoAAAANSUhEUgAAAAwAAAAOCAYAAAAbvf3sAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAADFGVYSWZNTQAqAAAACAAKAQ4AAgAAAARzZHIAAQ8AAgAAAAcAAACGARAAAgAAAAgAAACOARIAAwAAAAEAAQAAARoABQAAAAEAAACWARsABQAAAAEAAACeASgAAwAAAAEAAgAAATEAAgAAABgAAACmATIAAgAAABQAAAC+h2kABAAAAAEAAADSAAAAAEhVQVdFSQAAUFJBLUxYMgAAAABIAAAAAQAAAEgAAAABUFJBLUxYMiA4LjAuMC4zNzYoQzYzNSkAMjAyMjowNDowMyAxNToxNToxMQAAJYKaAAUAAAABAAAClIKdAAUAAAABAAACnIgiAAMAAAABAAIAAIgnAAMAAAABADIAAJAAAAcAAAAEMDIxMJADAAIAAAAUAAACpJAEAAIAAAAUAAACuJEBAAcAAAAEAQIDAJIBAAoAAAABAAACzJICAAUAAAABAAAC1JIDAAoAAAABAAAC3JIEAAoAAAABAAAC5JIHAAMAAAABAAUAAJIIAAMAAAABAAEAAJIJAAMAAAABABgAAJIKAAUAAAABAAAC7JKQAAIAAAAHAAAC9JKRAAIAAAAHAAAC/JKSAAIAAAAHAAADBKAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAAADKADAAQAAAABAAAADqIXAAMAAAABAAIAAKMAAAcAAAABAwAAAKMBAAcAAAABAQAAAKQBAAMAAAABAAEAAKQCAAMAAAABAAAAAKQDAAMAAAABAAAAAKQEAAUAAAABAAADDKQFAAMAAAABABoAAKQGAAMAAAABAAAAAKQHAAMAAAABAAAAAKQIAAMAAAABAAAAAKQJAAMAAAABAAAAAKQKAAMAAAABAAAAAKQMAAMAAAABAAAAAAAAAAAAAAA1AAAfQAAAAAsAAAAFMjAyMjowNDowMyAxNToxNToxMQAyMDIyOjA0OjAzIDE1OjE1OjExAAABztMAAA97AAAA4wAAAGQAAAAAAAAAAQAAAAAAAAABAAABfwAAAGQ2MDQ3NjAAADYwNDc2MAAANjA0NzYwAAAAAAABAAAAAdZS09MAAAAJcEhZcwAACxMAAAsTAQCanBgAAA7haVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWZFWD0iaHR0cDovL2NpcGEuanAvZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTgwPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6U2NlbmVDYXB0dXJlVHlwZT4wPC9leGlmOlNjZW5lQ2FwdHVyZVR5cGU+CiAgICAgICAgIDxleGlmOkV4cG9zdXJlQmlhc1ZhbHVlPjAvMTwvZXhpZjpFeHBvc3VyZUJpYXNWYWx1ZT4KICAgICAgICAgPGV4aWY6RXhwb3N1cmVUaW1lPjUzLzgwMDA8L2V4aWY6RXhwb3N1cmVUaW1lPgogICAgICAgICA8ZXhpZjpGb2NhbExlbkluMzVtbUZpbG0+MjY8L2V4aWY6Rm9jYWxMZW5JbjM1bW1GaWxtPgogICAgICAgICA8ZXhpZjpJU09TcGVlZFJhdGluZ3M+CiAgICAgICAgICAgIDxyZGY6U2VxPgogICAgICAgICAgICAgICA8cmRmOmxpPjUwPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC9leGlmOklTT1NwZWVkUmF0aW5ncz4KICAgICAgICAgPGV4aWY6TGlnaHRTb3VyY2U+MTwvZXhpZjpMaWdodFNvdXJjZT4KICAgICAgICAgPGV4aWY6R2FpbkNvbnRyb2w+MDwvZXhpZjpHYWluQ29udHJvbD4KICAgICAgICAgPGV4aWY6RXhpZlZlcnNpb24+MDIxMDwvZXhpZjpFeGlmVmVyc2lvbj4KICAgICAgICAgPGV4aWY6Q29sb3JTcGFjZT4xPC9leGlmOkNvbG9yU3BhY2U+CiAgICAgICAgIDxleGlmOkZsYXNoIHJkZjpwYXJzZVR5cGU9IlJlc291cmNlIj4KICAgICAgICAgICAgPGV4aWY6RnVuY3Rpb24+RmFsc2U8L2V4aWY6RnVuY3Rpb24+CiAgICAgICAgICAgIDxleGlmOkZpcmVkPkZhbHNlPC9leGlmOkZpcmVkPgogICAgICAgICAgICA8ZXhpZjpSZXR1cm4+MDwvZXhpZjpSZXR1cm4+CiAgICAgICAgICAgIDxleGlmOk1vZGU+MzwvZXhpZjpNb2RlPgogICAgICAgICAgICA8ZXhpZjpSZWRFeWVNb2RlPkZhbHNlPC9leGlmOlJlZEV5ZU1vZGU+CiAgICAgICAgIDwvZXhpZjpGbGFzaD4KICAgICAgICAgPGV4aWY6RXhwb3N1cmVQcm9ncmFtPjI8L2V4aWY6RXhwb3N1cmVQcm9ncmFtPgogICAgICAgICA8ZXhpZjpGb2NhbExlbmd0aD4zODMvMTAwPC9leGlmOkZvY2FsTGVuZ3RoPgogICAgICAgICA8ZXhpZjpCcmlnaHRuZXNzVmFsdWU+MC8xPC9leGlmOkJyaWdodG5lc3NWYWx1ZT4KICAgICAgICAgPGV4aWY6Rk51bWJlcj4xMS81PC9leGlmOkZOdW1iZXI+CiAgICAgICAgIDxleGlmOkNvbnRyYXN0PjA8L2V4aWY6Q29udHJhc3Q+CiAgICAgICAgIDxleGlmOlNoYXJwbmVzcz4wPC9leGlmOlNoYXJwbmVzcz4KICAgICAgICAgPGV4aWY6U3Vic2VjVGltZURpZ2l0aXplZD42MDQ3NjA8L2V4aWY6U3Vic2VjVGltZURpZ2l0aXplZD4KICAgICAgICAgPGV4aWY6V2hpdGVCYWxhbmNlPjA8L2V4aWY6V2hpdGVCYWxhbmNlPgogICAgICAgICA8ZXhpZjpNZXRlcmluZ01vZGU+NTwvZXhpZjpNZXRlcmluZ01vZGU+CiAgICAgICAgIDxleGlmOkNvbXBvbmVudHNDb25maWd1cmF0aW9uPgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaT4xPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MjwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpPjM8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT4wPC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOlNlcT4KICAgICAgICAgPC9leGlmOkNvbXBvbmVudHNDb25maWd1cmF0aW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFhEaW1lbnNpb24+MTYwPC9leGlmOlBpeGVsWERpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6RmlsZVNvdXJjZT4zPC9leGlmOkZpbGVTb3VyY2U+CiAgICAgICAgIDxleGlmOkV4cG9zdXJlTW9kZT4wPC9leGlmOkV4cG9zdXJlTW9kZT4KICAgICAgICAgPGV4aWY6Rmxhc2hQaXhWZXJzaW9uPjAxMDA8L2V4aWY6Rmxhc2hQaXhWZXJzaW9uPgogICAgICAgICA8ZXhpZjpBcGVydHVyZVZhbHVlPjIyNy8xMDA8L2V4aWY6QXBlcnR1cmVWYWx1ZT4KICAgICAgICAgPGV4aWY6U2NlbmVUeXBlPjE8L2V4aWY6U2NlbmVUeXBlPgogICAgICAgICA8ZXhpZjpDdXN0b21SZW5kZXJlZD4xPC9leGlmOkN1c3RvbVJlbmRlcmVkPgogICAgICAgICA8ZXhpZjpTYXR1cmF0aW9uPjA8L2V4aWY6U2F0dXJhdGlvbj4KICAgICAgICAgPGV4aWY6U3Vic2VjVGltZU9yaWdpbmFsPjYwNDc2MDwvZXhpZjpTdWJzZWNUaW1lT3JpZ2luYWw+CiAgICAgICAgIDxleGlmOkRpZ2l0YWxab29tUmF0aW8+MS8xPC9leGlmOkRpZ2l0YWxab29tUmF0aW8+CiAgICAgICAgIDxleGlmOlN1YmplY3REaXN0UmFuZ2U+MDwvZXhpZjpTdWJqZWN0RGlzdFJhbmdlPgogICAgICAgICA8ZXhpZjpTZW5zaW5nTWV0aG9kPjI8L2V4aWY6U2Vuc2luZ01ldGhvZD4KICAgICAgICAgPGV4aWY6U2h1dHRlclNwZWVkVmFsdWU+MTE4NDgzLzM5NjM8L2V4aWY6U2h1dHRlclNwZWVkVmFsdWU+CiAgICAgICAgIDxleGlmOlN1YnNlY1RpbWU+NjA0NzYwPC9leGlmOlN1YnNlY1RpbWU+CiAgICAgICAgIDxwaG90b3Nob3A6RGF0ZUNyZWF0ZWQ+MjAyMi0wNC0wM1QxNToxNToxMS42MDQ3NjA8L3Bob3Rvc2hvcDpEYXRlQ3JlYXRlZD4KICAgICAgICAgPHhtcDpDcmVhdGVEYXRlPjIwMjItMDQtMDNUMTU6MTU6MTEuNjA0NzYwPC94bXA6Q3JlYXRlRGF0ZT4KICAgICAgICAgPHhtcDpDcmVhdG9yVG9vbD5QUkEtTFgyIDguMC4wLjM3NihDNjM1KTwveG1wOkNyZWF0b3JUb29sPgogICAgICAgICA8eG1wOk1vZGlmeURhdGU+MjAyMi0wNC0wM1QxNToxNToxMS42MDQ3NjA8L3htcDpNb2RpZnlEYXRlPgogICAgICAgICA8dGlmZjpNYWtlPkhVQVdFSTwvdGlmZjpNYWtlPgogICAgICAgICA8dGlmZjpSZXNvbHV0aW9uVW5pdD4yPC90aWZmOlJlc29sdXRpb25Vbml0PgogICAgICAgICA8dGlmZjpYUmVzb2x1dGlvbj43MjwvdGlmZjpYUmVzb2x1dGlvbj4KICAgICAgICAgPHRpZmY6WVJlc29sdXRpb24+NzI8L3RpZmY6WVJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOk9yaWVudGF0aW9uPjE8L3RpZmY6T3JpZW50YXRpb24+CiAgICAgICAgIDx0aWZmOk1vZGVsPlBSQS1MWDI8L3RpZmY6TW9kZWw+CiAgICAgICAgIDxleGlmRVg6UGhvdG9ncmFwaGljU2Vuc2l0aXZpdHk+NTA8L2V4aWZFWDpQaG90b2dyYXBoaWNTZW5zaXRpdml0eT4KICAgICAgICAgPGRjOmRlc2NyaXB0aW9uPgogICAgICAgICAgICA8cmRmOkFsdD4KICAgICAgICAgICAgICAgPHJkZjpsaSB4bWw6bGFuZz0ieC1kZWZhdWx0Ij5zZHI8L3JkZjpsaT4KICAgICAgICAgICAgPC9yZGY6QWx0PgogICAgICAgICA8L2RjOmRlc2NyaXB0aW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4K2Po20QAAAapJREFUKBUtUm1y1DAMfZaVOF22Kct0OjB8nID7cQ4uwMX6i/9MobPdbWzLMs+BTMZOJPl9SA4/vn/r4GOtIXAv1WHWEGNEYKDZnsZYoyp0KwXCUjNjKMC9w6qh1QIPgs7/EOK/A+7QTrTG0v6fIRBKekdthvfJ8fl4wcUmPL7ewrtAS65E6JgoQUTgLEy94Muy4dPxGcdUyOJ4zsBPu4O6DwbC8n23OFa5Yk1POMQresk4VyW/4A5n3MgKrZS0SsaHlHFalHIKrBj+vNBRc7JXNiDt8QMq9OvxF1Y978EtB7yaY9tomMYmnUDhu1yjrwM26MPyhJdNcKGXwTba514hGtmliEZPJTcYZXU/Q39fFbl2JiiFEnSaKXlCZpvNRkN4sA0AIdSVXWJxZbL3wODMQuc+7YfHMDkrSJwR5hWSTtDMTmSa7GFk2Cyhceo3SgmSUOd7+M0Dqh7hzOlWOX4oGQQyJkq3jsSij2gstHQLikDkjIY8vRJNx70Z10IP8OkeNr0lYiKrYGQi71TgNxdo0Ddo8YA2n1An0saFUoY25rmNa0P83eMA/QvWLu1HwHEc4AAAAABJRU5ErkJggg=="};
const img2 = {"name": "t.png","data": "iVBORw0KGgoAAAANSUhEUgAAAA8AAAARCAYAAAACCvahAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAADFGVYSWZNTQAqAAAACAAKAQ4AAgAAAARkYXYAAQ8AAgAAAAcAAACGARAAAgAAAAgAAACOARIAAwAAAAEAAQAAARoABQAAAAEAAACWARsABQAAAAEAAACeASgAAwAAAAEAAgAAATEAAgAAABgAAACmATIAAgAAABQAAAC+h2kABAAAAAEAAADSAAAAAEhVQVdFSQAAUFJBLUxYMgAAAABIAAAAAQAAAEgAAAABUFJBLUxYMiA4LjAuMC4zNzYoQzYzNSkAMjAyMjowNDowMyAxNToxNDo1OQAAJYKaAAUAAAABAAAClIKdAAUAAAABAAACnIgiAAMAAAABAAIAAIgnAAMAAAABADIAAJAAAAcAAAAEMDIxMJADAAIAAAAUAAACpJAEAAIAAAAUAAACuJEBAAcAAAAEAQIDAJIBAAoAAAABAAACzJICAAUAAAABAAAC1JIDAAoAAAABAAAC3JIEAAoAAAABAAAC5JIHAAMAAAABAAUAAJIIAAMAAAABAAEAAJIJAAMAAAABABgAAJIKAAUAAAABAAAC7JKQAAIAAAAHAAAC9JKRAAIAAAAHAAAC/JKSAAIAAAAHAAADBKAAAAcAAAAEMDEwMKABAAMAAAABAAEAAKACAAQAAAABAAAAD6ADAAQAAAABAAAAEaIXAAMAAAABAAIAAKMAAAcAAAABAwAAAKMBAAcAAAABAQAAAKQBAAMAAAABAAEAAKQCAAMAAAABAAAAAKQDAAMAAAABAAAAAKQEAAUAAAABAAADDKQFAAMAAAABABoAAKQGAAMAAAABAAAAAKQHAAMAAAABAAAAAKQIAAMAAAABAAAAAKQJAAMAAAABAAAAAKQKAAMAAAABAAAAAKQMAAMAAAABAAAAAAAAAAAAAAZvAAZ7bQAAAAsAAAAFMjAyMjowNDowMyAxNToxNDo1OQAyMDIyOjA0OjAzIDE1OjE0OjU5AAABztMAAA97AAAA4wAAAGQAAAAAAAAAAQAAAAAAAAABAAABfwAAAGQxMDkwNTIAADEwOTA1MgAAMTA5MDUyAAAAAAABAAAAATEL41QAAAAJcEhZcwAACxMAAAsTAQCanBgAAA7laVRYdFhNTDpjb20uYWRvYmUueG1wAAAAAAA8eDp4bXBtZXRhIHhtbG5zOng9ImFkb2JlOm5zOm1ldGEvIiB4OnhtcHRrPSJYTVAgQ29yZSA2LjAuMCI+CiAgIDxyZGY6UkRGIHhtbG5zOnJkZj0iaHR0cDovL3d3dy53My5vcmcvMTk5OS8wMi8yMi1yZGYtc3ludGF4LW5zIyI+CiAgICAgIDxyZGY6RGVzY3JpcHRpb24gcmRmOmFib3V0PSIiCiAgICAgICAgICAgIHhtbG5zOmV4aWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20vZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczpwaG90b3Nob3A9Imh0dHA6Ly9ucy5hZG9iZS5jb20vcGhvdG9zaG9wLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOnhtcD0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wLyIKICAgICAgICAgICAgeG1sbnM6dGlmZj0iaHR0cDovL25zLmFkb2JlLmNvbS90aWZmLzEuMC8iCiAgICAgICAgICAgIHhtbG5zOmV4aWZFWD0iaHR0cDovL2NpcGEuanAvZXhpZi8xLjAvIgogICAgICAgICAgICB4bWxuczpkYz0iaHR0cDovL3B1cmwub3JnL2RjL2VsZW1lbnRzLzEuMS8iPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+MTEyPC9leGlmOlBpeGVsWURpbWVuc2lvbj4KICAgICAgICAgPGV4aWY6U2NlbmVDYXB0dXJlVHlwZT4wPC9leGlmOlNjZW5lQ2FwdHVyZVR5cGU+CiAgICAgICAgIDxleGlmOkV4cG9zdXJlQmlhc1ZhbHVlPjAvMTwvZXhpZjpFeHBvc3VyZUJpYXNWYWx1ZT4KICAgICAgICAgPGV4aWY6RXhwb3N1cmVUaW1lPjE2NDcvNDI0ODEzPC9leGlmOkV4cG9zdXJlVGltZT4KICAgICAgICAgPGV4aWY6Rm9jYWxMZW5JbjM1bW1GaWxtPjI2PC9leGlmOkZvY2FsTGVuSW4zNW1tRmlsbT4KICAgICAgICAgPGV4aWY6SVNPU3BlZWRSYXRpbmdzPgogICAgICAgICAgICA8cmRmOlNlcT4KICAgICAgICAgICAgICAgPHJkZjpsaT41MDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwvZXhpZjpJU09TcGVlZFJhdGluZ3M+CiAgICAgICAgIDxleGlmOkxpZ2h0U291cmNlPjE8L2V4aWY6TGlnaHRTb3VyY2U+CiAgICAgICAgIDxleGlmOkdhaW5Db250cm9sPjA8L2V4aWY6R2FpbkNvbnRyb2w+CiAgICAgICAgIDxleGlmOkV4aWZWZXJzaW9uPjAyMTA8L2V4aWY6RXhpZlZlcnNpb24+CiAgICAgICAgIDxleGlmOkNvbG9yU3BhY2U+MTwvZXhpZjpDb2xvclNwYWNlPgogICAgICAgICA8ZXhpZjpGbGFzaCByZGY6cGFyc2VUeXBlPSJSZXNvdXJjZSI+CiAgICAgICAgICAgIDxleGlmOkZ1bmN0aW9uPkZhbHNlPC9leGlmOkZ1bmN0aW9uPgogICAgICAgICAgICA8ZXhpZjpGaXJlZD5GYWxzZTwvZXhpZjpGaXJlZD4KICAgICAgICAgICAgPGV4aWY6UmV0dXJuPjA8L2V4aWY6UmV0dXJuPgogICAgICAgICAgICA8ZXhpZjpNb2RlPjM8L2V4aWY6TW9kZT4KICAgICAgICAgICAgPGV4aWY6UmVkRXllTW9kZT5GYWxzZTwvZXhpZjpSZWRFeWVNb2RlPgogICAgICAgICA8L2V4aWY6Rmxhc2g+CiAgICAgICAgIDxleGlmOkV4cG9zdXJlUHJvZ3JhbT4yPC9leGlmOkV4cG9zdXJlUHJvZ3JhbT4KICAgICAgICAgPGV4aWY6Rm9jYWxMZW5ndGg+MzgzLzEwMDwvZXhpZjpGb2NhbExlbmd0aD4KICAgICAgICAgPGV4aWY6QnJpZ2h0bmVzc1ZhbHVlPjAvMTwvZXhpZjpCcmlnaHRuZXNzVmFsdWU+CiAgICAgICAgIDxleGlmOkZOdW1iZXI+MTEvNTwvZXhpZjpGTnVtYmVyPgogICAgICAgICA8ZXhpZjpDb250cmFzdD4wPC9leGlmOkNvbnRyYXN0PgogICAgICAgICA8ZXhpZjpTaGFycG5lc3M+MDwvZXhpZjpTaGFycG5lc3M+CiAgICAgICAgIDxleGlmOlN1YnNlY1RpbWVEaWdpdGl6ZWQ+MTA5MDUyPC9leGlmOlN1YnNlY1RpbWVEaWdpdGl6ZWQ+CiAgICAgICAgIDxleGlmOldoaXRlQmFsYW5jZT4wPC9leGlmOldoaXRlQmFsYW5jZT4KICAgICAgICAgPGV4aWY6TWV0ZXJpbmdNb2RlPjU8L2V4aWY6TWV0ZXJpbmdNb2RlPgogICAgICAgICA8ZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgICAgICAgICAgPHJkZjpTZXE+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MTwvcmRmOmxpPgogICAgICAgICAgICAgICA8cmRmOmxpPjI8L3JkZjpsaT4KICAgICAgICAgICAgICAgPHJkZjpsaT4zPC9yZGY6bGk+CiAgICAgICAgICAgICAgIDxyZGY6bGk+MDwvcmRmOmxpPgogICAgICAgICAgICA8L3JkZjpTZXE+CiAgICAgICAgIDwvZXhpZjpDb21wb25lbnRzQ29uZmlndXJhdGlvbj4KICAgICAgICAgPGV4aWY6UGl4ZWxYRGltZW5zaW9uPjEwMTwvZXhpZjpQaXhlbFhEaW1lbnNpb24+CiAgICAgICAgIDxleGlmOkZpbGVTb3VyY2U+MzwvZXhpZjpGaWxlU291cmNlPgogICAgICAgICA8ZXhpZjpFeHBvc3VyZU1vZGU+MDwvZXhpZjpFeHBvc3VyZU1vZGU+CiAgICAgICAgIDxleGlmOkZsYXNoUGl4VmVyc2lvbj4wMTAwPC9leGlmOkZsYXNoUGl4VmVyc2lvbj4KICAgICAgICAgPGV4aWY6QXBlcnR1cmVWYWx1ZT4yMjcvMTAwPC9leGlmOkFwZXJ0dXJlVmFsdWU+CiAgICAgICAgIDxleGlmOlNjZW5lVHlwZT4xPC9leGlmOlNjZW5lVHlwZT4KICAgICAgICAgPGV4aWY6Q3VzdG9tUmVuZGVyZWQ+MTwvZXhpZjpDdXN0b21SZW5kZXJlZD4KICAgICAgICAgPGV4aWY6U2F0dXJhdGlvbj4wPC9leGlmOlNhdHVyYXRpb24+CiAgICAgICAgIDxleGlmOlN1YnNlY1RpbWVPcmlnaW5hbD4xMDkwNTI8L2V4aWY6U3Vic2VjVGltZU9yaWdpbmFsPgogICAgICAgICA8ZXhpZjpEaWdpdGFsWm9vbVJhdGlvPjEvMTwvZXhpZjpEaWdpdGFsWm9vbVJhdGlvPgogICAgICAgICA8ZXhpZjpTdWJqZWN0RGlzdFJhbmdlPjA8L2V4aWY6U3ViamVjdERpc3RSYW5nZT4KICAgICAgICAgPGV4aWY6U2Vuc2luZ01ldGhvZD4yPC9leGlmOlNlbnNpbmdNZXRob2Q+CiAgICAgICAgIDxleGlmOlNodXR0ZXJTcGVlZFZhbHVlPjExODQ4My8zOTYzPC9leGlmOlNodXR0ZXJTcGVlZFZhbHVlPgogICAgICAgICA8ZXhpZjpTdWJzZWNUaW1lPjEwOTA1MjwvZXhpZjpTdWJzZWNUaW1lPgogICAgICAgICA8cGhvdG9zaG9wOkRhdGVDcmVhdGVkPjIwMjItMDQtMDNUMTU6MTQ6NTkuMTA5MDUyPC9waG90b3Nob3A6RGF0ZUNyZWF0ZWQ+CiAgICAgICAgIDx4bXA6Q3JlYXRlRGF0ZT4yMDIyLTA0LTAzVDE1OjE0OjU5LjEwOTA1MjwveG1wOkNyZWF0ZURhdGU+CiAgICAgICAgIDx4bXA6Q3JlYXRvclRvb2w+UFJBLUxYMiA4LjAuMC4zNzYoQzYzNSk8L3htcDpDcmVhdG9yVG9vbD4KICAgICAgICAgPHhtcDpNb2RpZnlEYXRlPjIwMjItMDQtMDNUMTU6MTQ6NTkuMTA5MDUyPC94bXA6TW9kaWZ5RGF0ZT4KICAgICAgICAgPHRpZmY6TWFrZT5IVUFXRUk8L3RpZmY6TWFrZT4KICAgICAgICAgPHRpZmY6UmVzb2x1dGlvblVuaXQ+MjwvdGlmZjpSZXNvbHV0aW9uVW5pdD4KICAgICAgICAgPHRpZmY6WFJlc29sdXRpb24+NzI8L3RpZmY6WFJlc29sdXRpb24+CiAgICAgICAgIDx0aWZmOllSZXNvbHV0aW9uPjcyPC90aWZmOllSZXNvbHV0aW9uPgogICAgICAgICA8dGlmZjpPcmllbnRhdGlvbj4xPC90aWZmOk9yaWVudGF0aW9uPgogICAgICAgICA8dGlmZjpNb2RlbD5QUkEtTFgyPC90aWZmOk1vZGVsPgogICAgICAgICA8ZXhpZkVYOlBob3RvZ3JhcGhpY1NlbnNpdGl2aXR5PjUwPC9leGlmRVg6UGhvdG9ncmFwaGljU2Vuc2l0aXZpdHk+CiAgICAgICAgIDxkYzpkZXNjcmlwdGlvbj4KICAgICAgICAgICAgPHJkZjpBbHQ+CiAgICAgICAgICAgICAgIDxyZGY6bGkgeG1sOmxhbmc9IngtZGVmYXVsdCI+ZGF2PC9yZGY6bGk+CiAgICAgICAgICAgIDwvcmRmOkFsdD4KICAgICAgICAgPC9kYzpkZXNjcmlwdGlvbj4KICAgICAgPC9yZGY6RGVzY3JpcHRpb24+CiAgIDwvcmRmOlJERj4KPC94OnhtcG1ldGE+CnsN4FUAAAKHSURBVDgRPVPLctpAEGytVjxshHjZB99cflT+/56bLzknlbhISFwxYBmLp0GvlVbp2SpHsEjszkxPd4+8Lw+fm7wskWYlirzE1++PWMRbvKcFTin3TIWiMmiaBlVVwVrLu0UDQOdlwQ0PtW3w7ccjlnGCqlYslrvE0tQ8r10w410R/vLO5KYGisLg9+wJm+2BVRustzsYFlPKc6s0RPIYza8gS6InyJZPi+Ur5ssVD4DD+8Gh1BLEADmXj60liXfue57vntVqvUG8WnEDqMivH0ZM8dxzSS0KLssuPAngpYPgP3d92J+QZRlqVq5rcuAlCLLGoxHCwRDJW4JXAoRhiNF4gvglZmwFfUozlESU9gSxKAoI4mAwcOvIwtKWIE4uL6F1gOvraxhjoExpeKYcepoXVFnUb9CPIj5nmE5/Ybvd4mIyQb/fx/z5GfPFAq12m8mEF+mkTeEl4ihFq9ITQgZHUehEErvyNMVuv3cOiOdKWpLhEM6CLENRNxZvydrR6fVCtliRwhA7dpCT1nA4xEGKSMs1UY0sscEPcHbegx9o174E9c7P4Ps+VkmCG/Ltdrp4iWPq0GpzumiTW/SRRS4vLjCifsl6jc1uj0/3d06wm9tbaF9jNptRVANdcm6jQYRjTvWUZquFEyVjexnFC3vnFKeFxfyZDH1HJ89zqq6hptOfbDNEp9tlBxY+rZA5FxUlQLxOKdSfp79YLl/Iv0TA/Yax+ubuni1b9DgA4SnjeB7JW3HoA1fAUNX1ZuN4S8GKyUZeFL4UVFuRJ9ChCKPxGEGr5aqKXYK8ocIyNPJf5lo0sbZy1tJn+qt8LoV2p4OrqytE9PfDd02VnSNMBN+sj32ZiX8B+sxl5ZGoXgAAAABJRU5ErkJggg=="};

const recordNum = debug ? 10000 : 1000000;
const testRecordNum = 9;

const expectCategories = {
    '1': { name: '緊急の対応が必要' },
    '2': { name: '故障・不具合(大型)' },
    '3': { name: '故障・不具合(中型・小型)' },
    '4': { name: '異常の疑い(大型)' },
    '5': { name: '異常の疑い(中型・小型)' },
    '6': { name: 'お客様からの問い合わせ' },
    '7': { name: 'オフィス外装・インフラ' },
    '8': { name: '貸与品関連' },
    '9': { name: 'オフィス備品' },
    '10': { name: 'その他' }
  };

const record1Post = {
    title: 'title1',
    detail: 'detail1',
    categoryId: 1,
    fileIdList: undefined,
};

let record1Id = undefined;
let record1ItemList = [];
let allActiveNum = -1;
let allClosedNum = -1;

/* */

const sleep = (msec) => new Promise((resolve) => setTimeout(resolve, msec));

/* */

const testAuth = async(method, path) => {
    const r = await httpClient('ahoaho', method, path, {}, true);
    if (r.status !== 401) {
        throw Error(`${method} ${path}/ の認証が実施されていません。`);
    }
}

const httpClient = async (key, method, path, body, forAuthCheck = false) => {
    const url = `${target}${path}`;

    if (!forAuthCheck) {
        await testAuth(method, path);
    }

    const options = {
        url: url,
        headers: { 'content-type': 'application/json' },
        method: method,
        body: body ? JSON.stringify(body) : undefined
    }
    options.headers['x-app-key'] = key;

    const r = await axios({ url, headers: options.headers, method: options.method, data: options.body,
            validateStatus: function (status) {
                return status > 1;
            } });

    if (!forAuthCheck) {
        if (r.status !== 200) {
            throw Error(`${method} ${path} Unexpect status ${r.status}`);
        }
    }
    return r;
};

/* */

const checkObjectField = async (id, actual, expect, hint = '-') => {
    let keyCheckOk = true;
    const ngField = [];

    mylog(actual);
    for (let key of Object.keys(expect)) {
        if (actual[key] !== expect[key]) {
            keyCheckOk = false;
            ngField.push(key);
        }
    }
    if (!keyCheckOk) {
        console.log(ngField);
        throw Error(`${id}/ の応答結果の上記フィールドが不正です。(Hint: ${hint})`);
    }
}

const checkArrayResponse = async (id, actual, expect, hint = '-') => {
    console.log('items配列の件数をチェックします。');
    if (actual.length !== expect.length) {
        throw Error(`${id}/ で取得したitems配列の件数が想定と一致しません。 expect: ${expect.length}, actual: ${actual.length}`);
    }

    mylog('checkArrayResponse');
    mylog(expect);
    mylog(actual);

    let keyCheckOk = true;
    const ngField = [];
    console.log('items配列の各要素をチェックします。');
    for (let i = 0; i < expect.length; i++) {
        for (let key of Object.keys(expect[i])) {
            if (actual[i][key] !== expect[i][key]) {
                keyCheckOk = false;
                if (ngField.includes(key)) {
                    continue;
                }
                ngField.push(key);
            }
        }
    }
    if (!keyCheckOk) {
        console.log('取得結果: ');
        console.log(actual);
        console.log(ngField);
        throw Error(`${id}/ で取得したitems配列内で、上記フィールドが不正な要素あり。(Hint: ${hint})`);
    }

}

/* */

const commentRecord = async (key, recordId, value) => {
    let method = 'POST';
    let path = `records/${recordId}/comments`;
    const r_comment1 = await httpClient(key, method, path, {value: value});
    return r_comment1;
}

const getRecord = async (key, recordId)  => {
    const method = 'GET';
    const path = `records/${recordId}`;
    const r_getRecord = await httpClient(key, method, path, undefined);
    return r_getRecord;
}

const genRecordInfo = async (key, categoryId, isInversion) => {
    let method = 'POST';
    let path = 'records';

    const rPost = {
        title: 't',
        detail: 'd',
        categoryId: categoryId,
        fileIdList: !isInversion ?
            record1Post.fileIdList :
            [record1Post.fileIdList[1],record1Post.fileIdList[0]]
    };

    const r_postRecord = await httpClient(key, method, path, rPost);

    const recordId = r_postRecord.data.recordId;

    if (!recordId) {
        throw Error(`レコード登録反復処理に失敗しました。`);
    }

    method = 'GET';
    path = `records/${recordId}`;

    const r_getRecord = await getRecord(testKey2, recordId);
    const actualRecord = r_getRecord.data;

    return {
        recordId: recordId,
        itemList: [actualRecord.files[0].itemId, actualRecord.files[1].itemId],
        title: rPost.title,
    }
}

const check = async(func, tag) => {
    const key = func.name;
    console.log(`\n${tag}: START\n`);
    try {
        await func();
        result[key] = true;
        console.log(`\n=> OK`);
    } catch (e) {
        result[key] = false;
        hasError = true;
        console.log(e.message);
        console.log(`\n=> NG`);
    }
}


const testGetCategories = async() => {
    const method = 'GET';
    const path = 'categories';

    console.log("・カテゴリー一覧を取得します。");
    const r = await httpClient(testKey1, method, path, undefined);

    const actual = r.data.items;
    mylog(r.data.items);

    const categoryNum = Object.keys(expectCategories).length;

    if ( categoryNum !== Object.keys(actual).length) {
        throw Error(`GET categories/ カテゴリー数が一致しません`);
    }

    for (let i = 1; i <= categoryNum; i++) {
        if (expectCategories[String(i)].name !== actual[String(i)].name) {
            throw Error(`GET categories/ カテゴリ一覧が不正です。`);
        }
    }
}

const testRecordReadWrite = async () => {

    let method = 'POST';
    let path = 'files';

    console.log("・添付ファイルをアップロードします。");
    const r_file1 = await httpClient(testKey1, method, path, img1);
    const r_file2 = await httpClient(testKey1, method, path, img2);

    const file1Res = r_file1.data;
    const file2Res = r_file2.data;

    if (!file1Res.fileId || !file1Res.thumbFileId || !file2Res.fileId || !file2Res.thumbFileId) {
        mylog(file1Res);
        mylog(file2Res);
        throw Error(`POST files/ の応答からfileId,thumFileIdフィールドを解決できません。`);
    }

    record1Post.fileIdList = [file1Res, file2Res];

    path = 'records';
    console.log("・文書を登録します。");
    const r_postRecord = await httpClient(testKey1, method, path, record1Post);

    const postRecordRes = r_postRecord.data;

    if (!postRecordRes.recordId) {
        throw Error(`POST records/ の応答からrecordIdフィールドを解決できません。`);
    }

    record1Id = postRecordRes.recordId;

    console.log("・文書を閲覧します。");
    const r_getRecord = await getRecord(testKey1, record1Id);
    const actualRecord = r_getRecord.data;

    const expected = {
        recordId: record1Id,
        status: 'open',
        title: record1Post.title,
        detail: record1Post.detail,
        categoryId: record1Post.categoryId,
        categoryName: expectCategories[String(record1Post.categoryId)].name,
        applicationGroupName: testGroupName1,
        createdByName: testUserName1,
        createdByPrimaryGroupName: testGroupName1,
    }
    mylog(expected);

    await checkObjectField(`${method} ${path}`, actualRecord, 
        expected, '文書の登録内容と閲覧内容が一致しません。');

    const expectFiles = [{ name: img1.name }, {name: img2.name }];

    mylog(record1Post);

    if (actualRecord.files.length !== 2) {
        throw Error(`登録した文書を閲覧時の添付ファイル数が一致しません。`);
    }

    if (actualRecord.files[0].name !== expectFiles[0].name 
        ||actualRecord.files[1].name !== expectFiles[1].name ) {
        throw Error(`登録文書閲覧時の添付ファイルの順序、またはファイル名が不正です。`);
    }

    console.log("・添付ファイルを確認します。");
    const r_item1 = await httpClient(testKey1, 'GET', `records/${record1Id}/files/${actualRecord.files[0].itemId}`, undefined);
    const r_item2 = await httpClient(testKey1, 'GET', `records/${record1Id}/files/${actualRecord.files[1].itemId}`, undefined);

    if (Number(r_item1.headers['content-length']) < 1 * 1024
        || Number(r_item2.headers['content-length']) < 1 * 1024) {
            throw Error(`添付ファイル取得時のデータ量が小さすぎます。`);
    }

    record1ItemList = [actualRecord.files[0].itemId, actualRecord.files[1].itemId];
}

const testCommentReadWrite = async () => {
    const comment1 = 'c1';
    const comment2 = 'c2';

    console.log("・コメントします。");
    await commentRecord(testKey1, record1Id, comment1);
    await sleep(2500);
    await commentRecord(testKey2, record1Id, comment2);

    let method = 'GET';
    let path = `records/${record1Id}/comments`;
    console.log("・コメントを確認します。");
    const r_getComment = await httpClient(testKey1, method, path, undefined);

    const actual = r_getComment.data.items;

    expect = [
        {
            value: comment2,
            createdByName: testUserName2,
            createdByPrimaryGroupName: testGroupName2
        },
        {
            value: comment1,
            createdByName: testUserName1,
            createdByPrimaryGroupName: testGroupName1
        },
    ];

    await checkArrayResponse(`${method} ${path}`, actual, expect,
        `コメントは投稿が新しい順に配列にセットされます。`);

}

const checkRecordUpdate = async(recordId) => {
    let method = 'PUT';
    let path = `records/${recordId}`;
    console.log("・文書をクローズします。");
    await httpClient(testKey1, method, path, { status: 'closed' });

    const r = await getRecord(testKey2, recordId);

    if (r.data.status !== 'closed') {
        throw Error(`文書ステータスをclosedに変更しましたが、文書取得時に確認できませんでした。`);
    }
}

const checkListSimple = async (viewId, offset, limit, countTh, expect) => {
    let method = 'GET';
    let path = `record-views/${viewId}`;

    const r = await httpClient(testKey1, method, `${path}?offset=${offset}&limit=${limit}`, undefined);

    const actual = r.data.items;

    mylog(r.data);

    if (r.data.count < countTh) {
        throw Error(`GET record-view/${viewId}のCount値が小さすぎます。`);
    }

    await checkArrayResponse(`${method} ${path}`, actual, expect,
        `isUnConfirmedは文書閲覧時の既読処理が不正な場合もあります。`);

    if (viewId === 'allActive') {
        allActiveNum = r.data.count;
    } else if (viewId === 'allClosed') {
        allClosedNum = r.data.count;
    }
}

const testView = async() => {

    console.log("・一覧表示のための初期化をします。");
    await sleep(2500);
    const record2 = await genRecordInfo(testKey1, 1, true);
    const record3 = await genRecordInfo(testKey1, 2, false);
    const record4 = await genRecordInfo(testKey1, 3, false);
    const record5 = await genRecordInfo(testKey2, 3, false);
    const record6 = await genRecordInfo(testKey1, 2, false);

    // 5 6 3 2 4 1
    await sleep(2500);
    await commentRecord(testKey2, record2.recordId);
    await sleep(2500);
    await commentRecord(testKey2, record3.recordId);
    await sleep(2500);
    await commentRecord(testKey2, record6.recordId);
    await sleep(2500);
    await commentRecord(testKey2, record5.recordId);

    await checkRecordUpdate(record6.recordId);

    await getRecord(testKey1, record3.recordId);

    const cTitle = record2.title;

    const genRInfo = (recordId, isKey2, categoryId, count, isUnConfirmed, thumbNailItemId) => {
        return {
            recordId: recordId,
            title: recordId !== record1Id ? cTitle : record1Post.title,
            applicationGroupName: isKey2 ? testGroupName2 : testGroupName1,
            createdByName: isKey2 ? testUserName2 : testUserName1,
            //categoryId,
            commentCount: count,
            isUnConfirmed: isUnConfirmed,
            thumbNailItemId
        }
    }

    const r1Info = genRInfo(record1Id, false, 1, 2, true, record1ItemList[0]);
    const r2Info = genRInfo(record2.recordId, false, 1, 1, true, record2.itemList[0]);
    const r3Info = genRInfo(record3.recordId, false, 2, 1, false, record3.itemList[0]);
    const r4Info = genRInfo(record4.recordId, false, 3, 0, true, record4.itemList[0]);
    const r5Info = genRInfo(record5.recordId, true, 3, 1, true, record5.itemList[0]);
    const r6Info = genRInfo(record6.recordId, false, 2, 1, true, record6.itemList[0]);

    // 5 3 2 4 1 ...
    console.log("・全件を確認します。");
    const expectAllActive = [r3Info];
    await checkListSimple('allActive', 1, 1, 4, expectAllActive);

    // 3 2 4 1
    console.log("・自分が申請を確認します。");
    const expectMineActive = [r3Info, r2Info, r4Info, r1Info];
    await checkListSimple('mineActive', 0, 4, 3, expectMineActive);

    // 6 ...
    console.log("・クローズ済みを確認します。");
    const expectAllClosed = [r6Info];
    await checkListSimple('allClosed', 0, 1, 1, expectAllClosed);

    if (fallback) {
        // 5 3 2 1
        console.log("・自分宛を確認します。(LIMITの検証はスキップされます)");
        const expectToMeActive = [r5Info, r3Info, r2Info, r1Info];
        await checkListSimple('tomeActive', 0, 4, 3, expectToMeActive);
    } else {
        // 5 3 2 1
        console.log("・自分宛を確認します。");
        const expectToMeActive = [r5Info, r3Info, r2Info, r1Info];
        await checkListSimple('tomeActive', 0, 10, 3, expectToMeActive);
    }


    if (fallback) {
        console.log("・事前データの検証をSKIPします。");
        return;
    }
    console.log("・事前データを検証をします。");
    if ((allActiveNum + allClosedNum) !== (recordNum + testRecordNum)) {
        mylog(allActiveNum);
        mylog(allClosedNum)
        throw Error('文書合計数が不正です。');
    }
}

const addTest = async() => {
    try {
        let method = 'GET';
        let path = `record-views/allClosed`;

        console.log('細部をチェックします。');

        const r = await httpClient(testKey1, method, `${path}?offset=1&limit=3`, undefined);

        const actual = r.data.items;

        if (actual.length !== 3) {
            throw Error(`WARN: 追加検証中のallClosedの実行に失敗しました。 code:${actual.length}`);
        }
        mylog(actual);

        if (actual[0].recordId !== 'a' || actual[1].recordId !== 'b' || actual[2].recordId !== 'c') {
            throw Error(`WARN: RecordIDのソートが考慮されていない可能性があります。 code:${actual[0].recordId}${actual[1].recordId}${actual[2].recordId}`);
        }
    } catch(e) {
        console.log(e.message);
        console.log('WARN: 細部チェックに問題が見つかりました。考慮される場合があります。');
        fs.writeFileSync(warnFilePath, `${e.message}`);
        return;
    }
    fs.writeFileSync(warnFilePath, 'ok');
}

const main = async() => {

    if (fallback) {
        console.log("フォールバックモードのため、一部テストがスキップされます。");
    }
    console.log("\n\n== APIテスト開始。 == \n\n");
    await check(testGetCategories, '1.カテゴリーの取得(申請時のカテゴリー一覧が正しく取得できること)');
    await check(testRecordReadWrite, '2.文書の申請と閲覧(申請内容が正しく閲覧できること)');
    await check(testCommentReadWrite, '3.コメントの投稿と取得(文書へのコメント投稿およびその内容が正しく取得できること)');
    await check(testView, '4.文書一覧(タブごとに正しく文書のフィルター&並び替え&情報の表示ができること)');
    if (fallback) {
        console.log(`\n5.細部の確認: SKIP\n`)
    } else {
        await check(addTest, '5.細部の確認');
    }
    if (hasError) {
        fs.writeFileSync(resultFilePath, String(0));
    } else {
        fs.writeFileSync(resultFilePath, String(1));
    }
    console.log(`\n\n== APIテスト完了。 結果: ${hasError ? 'NG' : 'OK'} ==\n\n`);
}

main();
