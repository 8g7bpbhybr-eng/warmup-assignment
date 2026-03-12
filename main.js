const fs = require("fs");

// ============================================================
// Function 1: getShiftDuration(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getShiftDuration(startTime, endTime) {
    function parseClock(clockStr) {
        if (typeof clockStr !== "string") return NaN;
        var s = clockStr.trim().toLowerCase();
        var parts = s.split(" ").filter(function (x) {
            return x.trim().length > 0;
        });
        if (parts.length !== 2) return NaN;
        var timePart = parts[0];
        var meridiem = parts[1];
        if (meridiem !== "am" && meridiem !== "pm") return NaN;
        var t = timePart.split(":");
        if (t.length !== 3) return NaN;
        var h = parseInt(t[0], 10);
        var m = parseInt(t[1], 10);
        var sec = parseInt(t[2], 10);
        if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(sec)) return NaN;
        if (h < 1 || h > 12) return NaN;
        if (m < 0 || m > 59 || sec < 0 || sec > 59) return NaN;
        var hour24 = h % 12;
        if (meridiem === "pm") hour24 += 12;
        return hour24 * 3600 + m * 60 + sec;
    }

    function formatHms(totalSeconds) {
        var secs = Math.max(0, Math.floor(totalSeconds));
        var h = Math.floor(secs / 3600);
        var rem = secs % 3600;
        var m = Math.floor(rem / 60);
        var s = rem % 60;
        var mm = String(m);
        var ss = String(s);
        if (mm.length === 1) mm = "0" + mm;
        if (ss.length === 1) ss = "0" + ss;
        return String(h) + ":" + mm + ":" + ss;
    }

    var s = parseClock(startTime);
    var e = parseClock(endTime);
    if (!Number.isFinite(s) || !Number.isFinite(e)) return "0:00:00";
    var diff = e - s;
    if (diff < 0) diff += 24 * 3600;
    return formatHms(diff);
}

// ============================================================
// Function 2: getIdleTime(startTime, endTime)
// startTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// endTime: (typeof string) formatted as hh:mm:ss am or hh:mm:ss pm
// Returns: string formatted as h:mm:ss
// ============================================================
function getIdleTime(startTime, endTime) {
    function parseClock(clockStr) {
        if (typeof clockStr !== "string") return NaN;
        var s = clockStr.trim().toLowerCase();
        var parts = s.split(" ").filter(function (x) {
            return x.trim().length > 0;
        });
        if (parts.length !== 2) return NaN;
        var timePart = parts[0];
        var meridiem = parts[1];
        if (meridiem !== "am" && meridiem !== "pm") return NaN;
        var t = timePart.split(":");
        if (t.length !== 3) return NaN;
        var h = parseInt(t[0], 10);
        var m = parseInt(t[1], 10);
        var sec = parseInt(t[2], 10);
        if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(sec)) return NaN;
        if (h < 1 || h > 12) return NaN;
        if (m < 0 || m > 59 || sec < 0 || sec > 59) return NaN;
        var hour24 = h % 12;
        if (meridiem === "pm") hour24 += 12;
        return hour24 * 3600 + m * 60 + sec;
    }

    function formatHms(totalSeconds) {
        var secs = Math.max(0, Math.floor(totalSeconds));
        var h = Math.floor(secs / 3600);
        var rem = secs % 3600;
        var m = Math.floor(rem / 60);
        var s = rem % 60;
        var mm = String(m);
        var ss = String(s);
        if (mm.length === 1) mm = "0" + mm;
        if (ss.length === 1) ss = "0" + ss;
        return String(h) + ":" + mm + ":" + ss;
    }

    var s = parseClock(startTime);
    var e = parseClock(endTime);
    if (!Number.isFinite(s) || !Number.isFinite(e)) return "0:00:00";
    var duration = e - s;
    if (duration < 0) duration += 24 * 3600;

    var deliveryStart = 8 * 3600;
    var deliveryEnd = 22 * 3600;

    if (e < s) return "0:00:00";

    var overlapStart = Math.max(s, deliveryStart);
    var overlapEnd = Math.min(e, deliveryEnd);
    var activeWindow = Math.max(0, overlapEnd - overlapStart);
    var idle = Math.max(0, duration - activeWindow);
    return formatHms(idle);
}

// ============================================================
// Function 3: getActiveTime(shiftDuration, idleTime)
// shiftDuration: (typeof string) formatted as h:mm:ss
// idleTime: (typeof string) formatted as h:mm:ss
// Returns: string formatted as h:mm:ss
// ============================================================
function getActiveTime(shiftDuration, idleTime) {
    function parseHms(hms) {
        if (typeof hms !== "string") return NaN;
        var t = hms.trim().split(":");
        if (t.length !== 3) return NaN;
        var h = parseInt(t[0], 10);
        var m = parseInt(t[1], 10);
        var s = parseInt(t[2], 10);
        if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return NaN;
        if (h < 0 || m < 0 || m > 59 || s < 0 || s > 59) return NaN;
        return h * 3600 + m * 60 + s;
    }

    function formatHms(totalSeconds) {
        var secs = Math.max(0, Math.floor(totalSeconds));
        var h = Math.floor(secs / 3600);
        var rem = secs % 3600;
        var m = Math.floor(rem / 60);
        var s = rem % 60;
        var mm = String(m);
        var ss = String(s);
        if (mm.length === 1) mm = "0" + mm;
        if (ss.length === 1) ss = "0" + ss;
        return String(h) + ":" + mm + ":" + ss;
    }

    var dur = parseHms(shiftDuration);
    var idle = parseHms(idleTime);
    if (!Number.isFinite(dur) || !Number.isFinite(idle)) return "0:00:00";
    return formatHms(Math.max(0, dur - idle));
}

// ============================================================
// Function 4: metQuota(date, activeTime)
// date: (typeof string) formatted as yyyy-mm-dd
// activeTime: (typeof string) formatted as h:mm:ss
// Returns: boolean
// ============================================================
function metQuota(date, activeTime) {
    function parseHms(hms) {
        if (typeof hms !== "string") return NaN;
        var t = hms.trim().split(":");
        if (t.length !== 3) return NaN;
        var h = parseInt(t[0], 10);
        var m = parseInt(t[1], 10);
        var s = parseInt(t[2], 10);
        if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return NaN;
        if (h < 0 || m < 0 || m > 59 || s < 0 || s > 59) return NaN;
        return h * 3600 + m * 60 + s;
    }

    function isEid(dateStr) {
        if (typeof dateStr !== "string") return false;
        if (dateStr.length !== 10) return false;
        if (dateStr[4] !== "-" || dateStr[7] !== "-") return false;
        return dateStr >= "2025-04-10" && dateStr <= "2025-04-30";
    }

    var active = parseHms(activeTime);
    if (!Number.isFinite(active)) return false;
    var quotaSeconds = isEid(date) ? 6 * 3600 : 8 * 3600 + 24 * 60;
    return active >= quotaSeconds;
}

// ============================================================
// Function 5: addShiftRecord(textFile, shiftObj)
// textFile: (typeof string) path to shifts text file
// shiftObj: (typeof object) has driverID, driverName, date, startTime, endTime
// Returns: object with 10 properties or empty object {}
// ============================================================
function addShiftRecord(textFile, shiftObj) {
    if (!shiftObj || typeof shiftObj !== "object") return {};
    var driverID = String(shiftObj.driverID != null ? shiftObj.driverID : "").trim();
    var driverName = String(shiftObj.driverName != null ? shiftObj.driverName : "").trim();
    var date = String(shiftObj.date != null ? shiftObj.date : "").trim();
    var startTime = String(shiftObj.startTime != null ? shiftObj.startTime : "").trim();
    var endTime = String(shiftObj.endTime != null ? shiftObj.endTime : "").trim();
    if (!driverID || !driverName || !date || !startTime || !endTime) return {};

    var raw = fs.readFileSync(textFile, { encoding: "utf8", flag: "r" });
    var lines = [];
    var rawLines = raw.split("\n");
    for (var a = 0; a < rawLines.length; a++) {
        if (rawLines[a].trim().length > 0) lines.push(rawLines[a]);
    }
    if (lines.length === 0) return {};
    var header = lines[0];
    var records = [];
    for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(",");
        if (cols.length < 10) continue;
        records.push({
            driverID: cols[0],
            driverName: cols[1],
            date: cols[2],
            startTime: cols[3],
            endTime: cols[4],
            shiftDuration: cols[5],
            idleTime: cols[6],
            activeTime: cols[7],
            metQuota: cols[8] === "true",
            hasBonus: cols[9] === "true"
        });
    }

    for (var j = 0; j < records.length; j++) {
        if (records[j].driverID === driverID && records[j].date === date) return {};
    }

    var shiftDuration = getShiftDuration(startTime, endTime);
    var idleTime = getIdleTime(startTime, endTime);
    var activeTime = getActiveTime(shiftDuration, idleTime);
    var met = metQuota(date, activeTime);

    var newRecord = {
        driverID: driverID,
        driverName: driverName,
        date: date,
        startTime: startTime,
        endTime: endTime,
        shiftDuration: shiftDuration,
        idleTime: idleTime,
        activeTime: activeTime,
        metQuota: met,
        hasBonus: false
    };

    records.push(newRecord);
    records.sort(function (a, b) {
        if (a.driverID !== b.driverID) return a.driverID.localeCompare(b.driverID);
        return a.date.localeCompare(b.date);
    });

    var outLines = [header];
    for (var k = 0; k < records.length; k++) {
        var r = records[k];
        outLines.push(
            [
                r.driverID,
                r.driverName,
                r.date,
                r.startTime,
                r.endTime,
                r.shiftDuration,
                r.idleTime,
                r.activeTime,
                String(!!r.metQuota),
                String(!!r.hasBonus)
            ].join(",")
        );
    }
    fs.writeFileSync(textFile, outLines.join("\n") + "\n", { encoding: "utf8" });
    return newRecord;
}

// ============================================================
// Function 6: setBonus(textFile, driverID, date, newValue)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// date: (typeof string) formatted as yyyy-mm-dd
// newValue: (typeof boolean)
// Returns: nothing (void)
// ============================================================
function setBonus(textFile, driverID, date, newValue) {
    var id = String(driverID != null ? driverID : "").trim();
    var d = String(date != null ? date : "").trim();
    var raw = fs.readFileSync(textFile, { encoding: "utf8", flag: "r" });
    var lines = [];
    var rawLines = raw.split("\n");
    for (var a = 0; a < rawLines.length; a++) {
        if (rawLines[a].trim().length > 0) lines.push(rawLines[a]);
    }
    if (lines.length === 0) return;

    for (var i = 1; i < lines.length; i++) {
        var cols = lines[i].split(",");
        if (cols.length < 10) continue;
        if (cols[0] === id && cols[2] === d) {
            cols[9] = String(!!newValue);
            lines[i] = cols.join(",");
            break;
        }
    }
    fs.writeFileSync(textFile, lines.join("\n") + "\n", { encoding: "utf8" });
}

// ============================================================
// Function 7: countBonusPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof string) formatted as mm or m
// Returns: number (-1 if driverID not found)
// ============================================================
function countBonusPerMonth(textFile, driverID, month) {
    var id = String(driverID != null ? driverID : "").trim();
    var m = typeof month === "number" ? month : parseInt(String(month).trim(), 10);
    if (!Number.isFinite(m)) return -1;

    var raw = fs.readFileSync(textFile, { encoding: "utf8", flag: "r" });
    var lines = raw.split("\n");

    var anyDriver = false;
    for (var i = 1; i < lines.length; i++) {
        if (lines[i].trim().length === 0) continue;
        var cols = lines[i].split(",");
        if (cols.length < 10) continue;
        if (cols[0] === id) {
            anyDriver = true;
            break;
        }
    }
    if (!anyDriver) return -1;

    var count = 0;
    for (var k = 1; k < lines.length; k++) {
        if (lines[k].trim().length === 0) continue;
        var c = lines[k].split(",");
        if (c.length < 10) continue;
        if (c[0] !== id) continue;
        var recMonth = parseInt(String(c[2]).slice(5, 7), 10);
        if (recMonth === m && c[9] === "true") count++;
    }
    return count;
}

// ============================================================
// Function 8: getTotalActiveHoursPerMonth(textFile, driverID, month)
// textFile: (typeof string) path to shifts text file
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getTotalActiveHoursPerMonth(textFile, driverID, month) {
    var id = String(driverID != null ? driverID : "").trim();
    var m = typeof month === "number" ? month : parseInt(String(month).trim(), 10);
    if (!Number.isFinite(m)) return "0:00:00";

    function parseHms(hms) {
        if (typeof hms !== "string") return NaN;
        var t = hms.trim().split(":");
        if (t.length !== 3) return NaN;
        var h = parseInt(t[0], 10);
        var mm = parseInt(t[1], 10);
        var s = parseInt(t[2], 10);
        if (!Number.isFinite(h) || !Number.isFinite(mm) || !Number.isFinite(s)) return NaN;
        if (h < 0 || mm < 0 || mm > 59 || s < 0 || s > 59) return NaN;
        return h * 3600 + mm * 60 + s;
    }

    function formatHms(totalSeconds) {
        var secs = Math.max(0, Math.floor(totalSeconds));
        var h = Math.floor(secs / 3600);
        var rem = secs % 3600;
        var mm = Math.floor(rem / 60);
        var s = rem % 60;
        var mStr = String(mm);
        var sStr = String(s);
        if (mStr.length === 1) mStr = "0" + mStr;
        if (sStr.length === 1) sStr = "0" + sStr;
        return String(h) + ":" + mStr + ":" + sStr;
    }

    var raw = fs.readFileSync(textFile, { encoding: "utf8", flag: "r" });
    var lines = raw.split("\n");
    var total = 0;
    for (var i = 1; i < lines.length; i++) {
        if (lines[i].trim().length === 0) continue;
        var cols = lines[i].split(",");
        if (cols.length < 10) continue;
        if (cols[0] !== id) continue;
        var recMonth = parseInt(String(cols[2]).slice(5, 7), 10);
        if (recMonth !== m) continue;
        var secs = parseHms(cols[7]);
        if (Number.isFinite(secs)) total += secs;
    }
    return formatHms(total);
}

// ============================================================
// Function 9: getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month)
// textFile: (typeof string) path to shifts text file
// rateFile: (typeof string) path to driver rates text file
// bonusCount: (typeof number) total bonuses for given driver per month
// driverID: (typeof string)
// month: (typeof number)
// Returns: string formatted as hhh:mm:ss
// ============================================================
function getRequiredHoursPerMonth(textFile, rateFile, bonusCount, driverID, month) {
    var id = String(driverID != null ? driverID : "").trim();
    var m = typeof month === "number" ? month : parseInt(String(month).trim(), 10);
    if (!Number.isFinite(m)) return "0:00:00";

    function isEid(dateStr) {
        if (typeof dateStr !== "string") return false;
        if (dateStr.length !== 10) return false;
        if (dateStr[4] !== "-" || dateStr[7] !== "-") return false;
        return dateStr >= "2025-04-10" && dateStr <= "2025-04-30";
    }

    function formatHms(totalSeconds) {
        var secs = Math.max(0, Math.floor(totalSeconds));
        var h = Math.floor(secs / 3600);
        var rem = secs % 3600;
        var mm = Math.floor(rem / 60);
        var s = rem % 60;
        var mStr = String(mm);
        var sStr = String(s);
        if (mStr.length === 1) mStr = "0" + mStr;
        if (sStr.length === 1) sStr = "0" + sStr;
        return String(h) + ":" + mStr + ":" + sStr;
    }

    var rateRaw = fs.readFileSync(rateFile, { encoding: "utf8", flag: "r" });
    var rateLines = rateRaw.split("\n");
    var found = false;
    for (var r = 0; r < rateLines.length; r++) {
        if (rateLines[r].trim().length === 0) continue;
        var rc = rateLines[r].split(",");
        if (rc.length < 4) continue;
        if (rc[0] === id) {
            found = true;
            break;
        }
    }
    if (!found) return "0:00:00";

    var raw = fs.readFileSync(textFile, { encoding: "utf8", flag: "r" });
    var lines = raw.split("\n");
    var required = 0;
    for (var i = 1; i < lines.length; i++) {
        if (lines[i].trim().length === 0) continue;
        var cols = lines[i].split(",");
        if (cols.length < 10) continue;
        if (cols[0] !== id) continue;
        var recMonth = parseInt(String(cols[2]).slice(5, 7), 10);
        if (recMonth !== m) continue;
        required += isEid(cols[2]) ? 6 * 3600 : 8 * 3600 + 24 * 60;
    }

    var bonus = Number.isFinite(bonusCount) ? bonusCount : 0;
    required -= Math.max(0, Math.floor(bonus)) * 2 * 3600;
    if (required < 0) required = 0;
    return formatHms(required);
}

// ============================================================
// Function 10: getNetPay(driverID, actualHours, requiredHours, rateFile)
// driverID: (typeof string)
// actualHours: (typeof string) formatted as hhh:mm:ss
// requiredHours: (typeof string) formatted as hhh:mm:ss
// rateFile: (typeof string) path to driver rates text file
// Returns: integer (net pay)
// ============================================================
function getNetPay(driverID, actualHours, requiredHours, rateFile) {
    var id = String(driverID != null ? driverID : "").trim();
    function parseHms(hms) {
        if (typeof hms !== "string") return NaN;
        var t = hms.trim().split(":");
        if (t.length !== 3) return NaN;
        var h = parseInt(t[0], 10);
        var m = parseInt(t[1], 10);
        var s = parseInt(t[2], 10);
        if (!Number.isFinite(h) || !Number.isFinite(m) || !Number.isFinite(s)) return NaN;
        if (h < 0 || m < 0 || m > 59 || s < 0 || s > 59) return NaN;
        return h * 3600 + m * 60 + s;
    }

    var rateRaw = fs.readFileSync(rateFile, { encoding: "utf8", flag: "r" });
    var rateLines = rateRaw.split("\n");
    var basePay = NaN;
    var tier = NaN;
    for (var i = 0; i < rateLines.length; i++) {
        if (rateLines[i].trim().length === 0) continue;
        var cols = rateLines[i].split(",");
        if (cols.length < 4) continue;
        if (cols[0] !== id) continue;
        basePay = parseInt(cols[2], 10);
        tier = parseInt(cols[3], 10);
        break;
    }
    if (!Number.isFinite(basePay) || !Number.isFinite(tier)) return 0;

    var actualSec = parseHms(actualHours);
    var requiredSec = parseHms(requiredHours);
    if (!Number.isFinite(actualSec) || !Number.isFinite(requiredSec)) return basePay;

    var missingSec = Math.max(0, requiredSec - actualSec);
    var missingWholeHours = Math.floor(missingSec / 3600);

    var allowance = 0;
    if (tier === 1) allowance = 50;
    else if (tier === 2) allowance = 20;
    else if (tier === 3) allowance = 10;
    else if (tier === 4) allowance = 3;

    var chargeableMissing = Math.max(0, missingWholeHours - allowance);

    var deductionRatePerHour = Math.floor(basePay / 185);
    var salaryDeduction = chargeableMissing * deductionRatePerHour;
    return basePay - salaryDeduction;
}

module.exports = {
    getShiftDuration,
    getIdleTime,
    getActiveTime,
    metQuota,
    addShiftRecord,
    setBonus,
    countBonusPerMonth,
    getTotalActiveHoursPerMonth,
    getRequiredHoursPerMonth,
    getNetPay
};
