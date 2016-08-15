db = window.openDatabase("PlanDB", "1.0", "KamilKlosowskiPLAN", 1024 * 1024);
dt = new Date();

$(document).ready(function () {
    createDB();
    divHome();
    Clock();
    init();

    

});



function removeRow(ths) {
    ths.remove();

    db.transaction(function (tx) {

        tx.executeSql("DELETE FROM " + ths.attr('data-dbtable') + " WHERE id=" + ths.attr('data-dbid') + ";");

    }, onError);
}

function delLess(t) {
    db.transaction(function (tx) {
        t.html("").css({ opacity: '0' });
        tx.executeSql("DELETE FROM Lekcje WHERE id_dnia = " + t.attr('data-day-id') + " AND id_godziny = " + t.attr('data-hour-id') + ";");
    }, onError);
    setTimeout(divWeek, 100);
}

function upcoming() {
    var currentID = -1;
    var nextID = -1;

    db.transaction(function (tx) {

        tx.executeSql("SELECT * FROM Godziny ORDER BY godz_od, min_od", [],
        function (tx, results) {

            for (var i = 0; i < results.rows.length; i++) {
                var startparsed = parseT(results.rows.item(i).godz_od) + ':' + parseT(results.rows.item(i).min_od) + ":00";
                var endparsed = parseT(results.rows.item(i).godz_do) + ':' + parseT(results.rows.item(i).min_do) + ":00";
                var nowparsed = parseT(dt.getHours()) + ':' + parseT(dt.getMinutes()) + ':' + parseT(dt.getSeconds());
                if (startparsed < nowparsed && endparsed > nowparsed) {
                    currentID = results.rows.item(i)['id'];
                }
                var nextStartParsed = parseT(results.rows.item(i).godz_od) + ':' + parseT(results.rows.item(i).min_od) + ":00";
                var nextEndParsed = parseT(results.rows.item(i).godz_do) + ':' + parseT(results.rows.item(i).min_do) + ":00";
                if (nextStartParsed > nowparsed && nextID == -1) {
                    nextID = results.rows.item(i)['id'];
                }
            }
        }, onError);
    }, onError);



    db.transaction(function (tx) {
        tx.executeSql("SELECT Lekcje.numer_sali, Lekcje.id_godziny, Przedmioty.nazwa_dluga " +
            "FROM Lekcje " +
            "LEFT JOIN Przedmioty ON Lekcje.id_przedmiotu = Przedmioty.id " +
           " WHERE (Lekcje.id_godziny = " + currentID + " OR Lekcje.id_godziny = " + nextID + ") AND Lekcje.id_dnia =" + dt.getDay(), [],
        function (tx, results) {
            for (var i = 0; i < results.rows.length; i++) {
                if (results.rows.item(i).id_godziny == currentID) $("#main > .jumbotron > h3:nth-child(2)").html("Lesson now: <br>" + results.rows.item(i).nazwa_dluga + "  Sala " + results.rows.item(i).numer_sali);
                else $("#main > .jumbotron > h3:nth-child(1)").html('No lesson in now');
                if (results.rows.item(i).id_godziny == nextID) $("#main > .jumbotron > h3:nth-child(3)").html("Next Lesson: <br>" + results.rows.item(i).nazwa_dluga + "  Sala " + results.rows.item(i).numer_sali);
            }
        }, onError);


    }, onError);


}

function onError(e) {
    console.log(e);
}

function createDB() {
    db.transaction(function (tx) {
        tx.executeSql("CREATE TABLE IF NOT EXISTS Lekcje (id INTEGER PRIMARY KEY unique, numer_sali VARCHAR(5), id_dnia INTEGER, id_godziny INTEGER, id_nauczyciela INTEGER, id_przedmiotu INTEGER)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS Dni (id INTEGER PRIMARY KEY unique, nazwa_krotka VARCHAR(5) unique, nazwa_dluga VARCHAR(15) unique)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS Godziny (id INTEGER PRIMARY KEY unique, godz_od INTEGER,godz_do INTEGER,min_od INTEGER, min_do INTEGER)");
        tx.executeSql("CREATE TABLE IF NOT EXISTS Przedmioty (id INTEGER PRIMARY KEY unique, nazwa_krotka VARCHAR(5), nazwa_dluga VARCHAR(15))");
        tx.executeSql("CREATE TABLE IF NOT EXISTS Nauczyciele (id INTEGER PRIMARY KEY unique, imie VARCHAR(10), nazwisko VARCHAR(20))");
        tx.executeSql("CREATE TABLE IF NOT EXISTS Kolory (id INTEGER PRIMARY KEY unique, kolor VARCHAR(20), kolor_id INTEGER)");
    }, onError);

}

function Clock() {
    var today = new Date();
    var h = today.getHours();
    var m = today.getMinutes();
    var s = today.getSeconds();
    m = parseT(m);
    s = parseT(s);
    $('#clock').html(h + ":" + m + ":" + s);
    var t = setTimeout(function () { Clock() }, 500);
}

function emptyDB() {
    db.transaction(function (tx) {
        alert('');
        tx.executeSql("DELETE FROM Lekcje WHERE id > 0");
        tx.executeSql("DELETE FROM Dni WHERE id > 0");
        tx.executeSql("DELETE FROM Godziny WHERE id > 0");
        tx.executeSql("DELETE FROM Przedmioty WHERE id > 0");
        tx.executeSql("DELETE FROM Nauczyciele WHERE id > 0");
        tx.executeSql("DELETE FROM Kolory WHERE id > 0");
    }, onError);

}

function DBJSON(tx) {
    DatabaseJSON = [];
    Lekcje = [];
    Dni = [];
    Godziny = [];
    Przedmioty = [];
    Nauczyciele = [];

    tx.executeSql("SELECT * FROM Nauczyciele", [],
       function (tx, results) {
           for (var i = 0; i < results.rows.length; i++) {

               Nauczyciele.push({
                   id: results.rows.item(i)['id'],
                   imie: results.rows.item(i)['imie'],
                   nazwisko: results.rows.item(i)['nazwisko']
               })
           }
       }, onError)

    tx.executeSql("SELECT * FROM Przedmioty", [],
    function (tx, results) {
        for (var i = 0; i < results.rows.length; i++) {
            Przedmioty.push({
                id: results.rows.item(i)['id'],
                nazwa_krotka: results.rows.item(i)['nazwa_krotka'],
                nazwa_dluga: results.rows.item(i)['nazwa_dluga']
            });
        }
    }, onError)

    tx.executeSql("SELECT * FROM Godziny", [],
    function (tx, results) {
        for (var i = 0; i < results.rows.length; i++) {
            Godziny.push({
                id: results.rows.item(i)['id'],
                godz_od: results.rows.item(i)['godz_od'],
                godz_do: results.rows.item(i)['godz_do'],
                min_od: results.rows.item(i)['min_od'],
                min_do: results.rows.item(i)['min_do']
            });
        }
    }, onError)

    tx.executeSql("SELECT * FROM Dni", [],
    function (tx, results) {
        for (var i = 0; i < results.rows.length; i++) {
            Dni.push({
                id: results.rows.item(i)['id'],
                nazwa_krotka: results.rows.item(i)['nazwa_krotka'],
                nazwa_dluga: results.rows.item(i)['nazwa_dluga']
            });
        }
    }, onError)

    tx.executeSql("SELECT * FROM Lekcje", [],
    function (tx, results) {
        for (var i = 0; i < results.rows.length; i++) {
            Lekcje.push({
                id: results.rows.item(i)['id'],
                numer_sali: results.rows.item(i)['numer_sali'],
                id_dnia: results.rows.item(i)['id_dnia'],
                id_godziny: results.rows.item(i)['id_godziny'],
                id_nauczyciela: results.rows.item(i)['id_nauczyciela'],
                id_przedmiotu: results.rows.item(i)['id_przedmiotu']
            });
        }
    }, onError)
    setTimeout(function () {
        DatabaseJSON = {
            LekcjeTabela: Lekcje,
            DniTabela: Dni,
            GodzinyTabela: Godziny,
            PrzedmiotyTabela: Przedmioty,
            NauczycieleTabela: Nauczyciele
        };
        alert(JSON.stringify(DatabaseJSON, null, 4));
    }, 200)
}

function Camera() {

    navigator.camera.getPicture(
        camSuccess,
        camError,
        camOptions);

    function camSuccess(fileUri) {
        $('#main').css('background', 'url("' + fileUri + '")');
    }

    var camOptions = {
        quality: 50,
        destinationType: Camera.DestinationType.FILE_URI,
        sourceType: Camera.PictureSourceType.CAMERA

    };


    function camError(error) {
        console.log(error.message)
    }
}

function divColors() {
    $('#main').empty().append('<form role="form" class="form-inline"> <div class="form-group"> <label for="colorpicker-1"> Header Color </label> <input type="text" class="form-control" id="colorpicker-1" value="#C1C1C1" /> </div> <div class="form-group"> <label for="colorpicker-2"> Body Color </label> <input type="text" class="form-control" id="colorpicker-2" value="#C2C2C2" /> </div> <div class="form-group"> <label for="colorpicker-2"> Font Color </label> <input type="text" class="form-control" id="colorpicker-3" value="#C3C3C3" /> </div> </form>');
    //COLOR PICKER EVENTS
    $(function () {
        $('#colorpicker-1').colorpicker().on('changeColor.colorpicker', function (event) {
            $('.navbar-header').css({ backgroundColor: event.color.toHex() });
        });
    });
    $(function () {
        $('#colorpicker-2').colorpicker().on('changeColor.colorpicker', function (event) {
            $('body').css({ backgroundColor: event.color.toHex() });
        });
    });
    $(function () {
        $('#colorpicker-3').colorpicker().on('changeColor.colorpicker', function (event) {
            $('*').css({ color: event.color.toHex() });
        });
    });
}

function divTeachers() {
    $('#main').empty().append('<table class="table table-striped"> <thead> <tr> <th>Firstname</th> <th>Lastname</th> </tr> </thead> <tbody id="tbody-teachers"> </tbody> </table> <form class="form-inline" role="form"> <div class="form-group"> <label for="teacher-name-ti">First name:</label> <input type="text" class="form-control" id="teacher-name-ti"> </div> <div class="form-group"> <label for="teacher-lastname-ti">Last Name:</label> <input type="text" class="form-control" id="teacher-lastname-ti"> </div> <button type="reset" class="btn btn-default" id="teacher-add-btn">Add</button> </form>');
    $('#teacher-add-btn').click(addTeacher);
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM Nauczyciele", [],
            function (tx, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    row = $("<tr>").on('taphold', function (e) { removeRow($(this)); }).attr('data-dbtable', 'Nauczyciele').attr('data-dbid', results.rows.item(i)['id']);
                    $("#tbody-teachers").append(row);
                    row.append($("<td>").html(results.rows.item(i).imie).attr('data-dbcol', 'imie'));
                    row.append($("<td>").html(results.rows.item(i).nazwisko).attr('data-dbcol', 'nazwisko'));
                }
            }, onError)
    }, onError);
}

function divHours() {
    $('#main').empty().append(' <table class="table table-striped"> <thead> <tr> <th> Lesson Start </th> <th> Lesson End </th> </tr> </thead> <tbody id="tbody-hours"> </tbody> </table> <form class="form-inline" role="form"> <label for="hour-start-ti">Lesson Start Time:</label> <div class="input-group clockpicker"> <input type="text" class="form-control" id="hour-start-ti"> <span class="input-group-addon"> <span class="glyphicon glyphicon-time"></span> </span> </div><br /> <label for="hour-end-ti">Lesson End Time:</label> <div class="input-group clockpicker"> <input type="text" class="form-control" id="hour-end-ti"> <span class="input-group-addon"> <span class="glyphicon glyphicon-time"></span> </span> </div><br /> <button type="reset" class="btn btn-default" id="hour-add-btn">Add</button> </form>');
    $('#hour-add-btn').click(addHour);
    $('.clockpicker').clockpicker({
        placement: 'bottom',
        align: 'right',
        autoclose: 'true',
        vibrate: 'True'
    });
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM Godziny ORDER BY godz_od ASC, min_od ASC", [],
            function (tx, results) {
                for (var i = 0; i < results.rows.length; i++)
                {
                    row = $("<tr>").on('taphold', function (e) { removeRow($(this)); }).attr('data-dbtable', 'Godziny').attr('data-dbid', results.rows.item(i)['id']);
                   $("#tbody-hours").append(row);
                   row.append($("<td>").html(parseT(results.rows.item(i).godz_od) + ':' + parseT(results.rows.item(i).min_od)).attr('data-dbcol', 'od'));
                   row.append($("<td>").html(parseT(results.rows.item(i).godz_do) + ':' + parseT(results.rows.item(i).min_do)).attr('data-dbcol', 'do'));
                }
            },onError)
    }, onError);

}

function divSubjects() {
    $('#main').empty().append('<table class="table table-striped"> <thead> <tr> <th> Subject Short </th> <th> Subject Full </th> </tr> </thead> <tbody id="tbody-subjects"> </tbody> </table> <form class="form-inline" role="form"> <div class="form-group"> <label for="subject-name-ti"> Subject Short Name: </label> <input type="text" class="form-control" id="subject-name-ti"> </div> <div class="form-group"> <label for="subject-fullname-ti"> Subject Full Name: </label> <input type="text" class="form-control" id="subject-fullname-ti"> </div> <button type="reset" class="btn btn-default" id="subject-add-btn">Add</button> </form>');
    $('#subject-add-btn').click(addSubject);
    db.transaction(function (tx) {
        tx.executeSql("SELECT * FROM Przedmioty", [],
            function (tx, results) {
                for (var i = 0; i < results.rows.length; i++) {
                    row = $("<tr>").on('taphold', function (e) { removeRow($(this)); }).attr('data-dbtable', 'Przedmioty').attr('data-dbid', results.rows.item(i)['id']);
                    $("#tbody-subjects").append(row);
                    row.append($("<td>").html(results.rows.item(i).nazwa_krotka).attr('data-dbcol', 'nazwa_krotka'));
                    row.append($("<td>").html(results.rows.item(i).nazwa_dluga).attr('data-dbcol', 'nazwa_dluga'));
                }
            }, onError)
    }, onError);
}

function divHome() {
    $('#main').empty().append('<div class="jumbotron text-center"> <div class="row"><h1 id="clock"></h1></div> <h3></h3> <h3></h3> </div>');
    Clock();
    upcoming();
}

function divToday() {

    $('#main').empty().append('<table class="table table-striped"> <thead> <tr> <th>Hour</th> <th>Subject</th><th>Class</th> </tr> </thead> <tbody id="tbody-today"> </tbody> </table>');
    
    db.transaction(function (tx) {
    tx.executeSql("SELECT Lekcje.id, Lekcje.numer_sali, Lekcje.id_dnia, Przedmioty.nazwa_dluga, Godziny.godz_od, Godziny.min_od, Godziny.godz_do, Godziny.min_do FROM Lekcje " +
       "LEFT JOIN Przedmioty ON Lekcje.id_przedmiotu = Przedmioty.id " +
       "LEFT JOIN Godziny ON Lekcje.id_godziny = Godziny.id " +
       "WHERE Lekcje.id_dnia = " + dt.getDay() +
       " ORDER BY Godziny.godz_od, Godziny.min_od"
       , [],
      function (tx, results) {
          if (results.rows.length == 0) {
              row = $("<tr>").attr('data-dbtable', 'Lekcje');
                  
              $("#tbody-today").append(row);
              row.append($("<td>").html('<h1>No Lessons Today</h1>'))

          }
          for (var i = 0; i < results.rows.length; i++) {

              row = $("<tr>");
              $("#tbody-today").append(row);

              row.append($("<td>")
                  .html(parseT(results.rows.item(i).godz_od) + ':' + parseT(results.rows.item(i).min_od) +
                  '~' + parseT(results.rows.item(i).godz_do) + ':' + parseT(results.rows.item(i).min_do)).attr('data-dbid', results.rows.item(i).id));

              row.append($("<td>")
              .html(results.rows.item(i).nazwa_dluga)).attr('data-dbid', results.rows.item(i).id);

              row.append($("<td>")
              .html('S.' + results.rows.item(i).numer_sali).attr('data-dbid', results.rows.item(i).id));

          };
      },onError);
    }, onError);

}

function divWeek() {
    $('#main').empty().append(' <table class="table table-bordered" id="week-table"> <thead> <tr> <th> # </th> <th> Mon </th> <th> Tue </th> <th> Wed </th> <th> Thu </th> <th> Fri </th> </tr> </thead> <tbody id="tbody-week"> </tbody> </table> <form class="form-inline" role="form" id="week-form"> <div class="form-group"> <label for="subject-select">Subject:</label> <select class="form-control" id="subject-select"></select> </div> <div class="form-group"> <label for="teacher-select">Teacher:</label> <select class="form-control" id="teacher-select"></select> </div> <div class="form-group"> <label for="hour-select">Time:</label> <select class="form-control" id="hour-select"></select> </div> <div class="form-group"> <label for="day-select">Day:</label> <select class="form-control" id="day-select"> <option value="1">Monday</option> <option value="2">Tuesday</option> <option value="3">Wednesday</option> <option value="4">Thursday</option> <option value="5">Friday</option></select> </div> <div class="form-group"> <label for="classroom-ti">Classroom:</label> <input type="text" class="form-control" id="classroom-ti" value="000"> </div> <button type="button" class="btn btn-default" id="lesson-add-btn" style="margin-bottom: 20px;">Add</button> <button type="button" class="btn btn-default" id="lesson-update-btn" style="margin-bottom: 20px;">Update</button></form>');
    loadLessonsForm();

    $('#lesson-add-btn').click(addLesson);
    $('#lesson-update-btn').attr('disabled', true);
    $('#lesson-update-btn').click(updateLesson);


    db.transaction(function (tx) {
    tx.executeSql("SELECT * FROM Godziny ORDER BY godz_od, min_od", [], function (tx, results) {

        for (var i = 0; i < results.rows.length; i++) {
            row = $("<tr>").attr('data-dbtable', 'Lekcje').attr('data-hour-id', results.rows.item(i).id);
            $("#tbody-week").append(row);
            row.append($("<td>").html(parseT(results.rows.item(i).godz_od) + ':' + parseT(results.rows.item(i).min_od) + "<br>" + parseT(results.rows.item(i).godz_do) + ':' + parseT(results.rows.item(i).min_do)));
            for (var j = 1; j <= 5; j++) {
                row.append($("<td>").attr('data-day-id', j).attr('data-hour-id', results.rows.item(i).id));
            }
        }

    }, onError);

    tx.executeSql("SELECT Lekcje.id, Lekcje.numer_sali, Lekcje.id_dnia, Lekcje.id_godziny, Przedmioty.nazwa_krotka, Godziny.godz_od, Godziny.min_od, Godziny.godz_do, Godziny.min_do FROM Lekcje " +
         "LEFT JOIN Przedmioty ON Lekcje.id_przedmiotu = Przedmioty.id " +
         "LEFT JOIN Godziny ON Lekcje.id_godziny = Godziny.id "
         , [], function (tx, results) {

             for (var i = 0; i < results.rows.length; i++) {

                 $('#tbody-week tr[data-hour-id="' + results.rows.item(i).id_godziny + '"] > td[data-day-id="' + results.rows.item(i).id_dnia + '"]')
                 .css({ backgroundColor: 'rgba(200,200,200,0.15)' })
                 .html(results.rows.item(i).nazwa_krotka + " </br> S." + results.rows.item(i).numer_sali)
                 .attr('data-dbid', results.rows.item(i).id)
                 .click(function () { setForUpdateLesson($(this)) })
                 .on('taphold', function (e) { delLess($(this)); });
             }

         }, onError);
    }, onError);

}

function parseT(i) {
    if (i < 10) { i = "0" + i };
    return i;
}

function addTeacher() {
    var name = $('#teacher-name-ti').val();
    var lastname = $('#teacher-lastname-ti').val();
    if (name != "" && lastname != "") {
        db.transaction(function (tx) {
            tx.executeSql(
                "INSERT INTO Nauczyciele (imie, nazwisko)" +
                "VALUES ('" + name + "', '" + lastname + "')");
        }, onError);
    }
    else alert('Enter both values!');
    divTeachers();
}

function addSubject() {
    var name = $('#subject-name-ti').val();
    var fullname = $('#subject-fullname-ti').val();
    if (name != "" && fullname != "") {
        db.transaction(function (tx) {
            tx.executeSql(
                "INSERT INTO Przedmioty (nazwa_krotka, nazwa_dluga)" +
                "VALUES ('" + name + "', '" + fullname + "')");
        }, onError);
    }
    else alert('Enter both values!');
    divSubjects();
}

function addHour() {
    var hourStart = $('#hour-start-ti').val();
    var hourEnd = $('#hour-end-ti').val();

    if(hourStart != "" && hourEnd != "")
    {
        db.transaction(function (tx) {

            tx.executeSql(
                "INSERT INTO Godziny (godz_od, godz_do, min_od, min_do)" +
                "VALUES (" + hourStart.split(':')[0] + "," + hourEnd.split(':')[0] + "," + hourStart.split(':')[1] + "," + hourEnd.split(':')[1] + ")");
        }, onError);

    }
    else alert('Enter both values!');

    divHours();

}

function loadLessonsForm() {
    db.transaction(function (tx) {
    tx.executeSql("SELECT * FROM Przedmioty", [],
      function (tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
              $("#subject-select").append($("<option></option>").attr('value', results.rows.item(i).id).text(results.rows.item(i).nazwa_dluga));
          }
      });
    tx.executeSql("SELECT * FROM Nauczyciele", [],
      function (tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
              $("#teacher-select").append($("<option></option>").attr('value', results.rows.item(i).id).text(results.rows.item(i).imie + " " + results.rows.item(i).nazwisko));
          }
      });
    tx.executeSql("SELECT * FROM Godziny ORDER BY godz_od, min_od", [],
      function (tx, results) {
          for (var i = 0; i < results.rows.length; i++) {
              $("#hour-select").append($("<option></option>").attr('value', results.rows.item(i).id).text(parseT(results.rows.item(i).godz_od) + ':' + parseT(results.rows.item(i).min_od) +
                   '-' + parseT(results.rows.item(i).godz_do) + ':' + parseT(results.rows.item(i).min_do)));
          }
      });

    }, onError);
}

function addLesson() {
    db.transaction(function (tx) {
        tx.executeSql("INSERT INTO Lekcje (numer_sali, id_dnia, id_godziny, id_nauczyciela, id_przedmiotu)" +
        " VALUES(" + $('#classroom-ti').val() + ", " + $('#day-select').val() + ", " +
        $('#hour-select').val() + ", " + $('#teacher-select').val() + ", " + $('#subject-select').val() + ")");
    },onError);
    setTimeout(divWeek, 200);

}

function setForUpdateLesson(ths) {
    $('#lesson-update-btn').removeAttr('disabled');
    $('#hour-select').val(ths.attr('data-hour-id'));
    $('#day-select').val(ths.attr('data-day-id'));
    idforupdate = ths.attr('data-dbid');
}

function updateLesson(ths) {
    db.transaction(function (tx) {
        tx.executeSql("UPDATE Lekcje " +
        " SET numer_sali = "+ $('#classroom-ti').val() + ", id_dnia = " + $('#day-select').val() + ", id_godziny = " +
        $('#hour-select').val() + ", id_nauczyciela = " + $('#teacher-select').val() + ", id_przedmiotu =" + $('#subject-select').val() + " WHERE id = " + idforupdate)}
    , onError);    
    setTimeout(divWeek, 200);
}

function init() {
    $('#menu-settings-dropdown a').on('click', function () { $(".navbar-toggle").click(); });
    $('#bs-navbar-collapse li').not('.dropdown').on('click', function () { $(".navbar-toggle").click(); });

    $('#settings-colors').click(divColors);
    $('#settings-teachers').click(divTeachers);
    $('#settings-subjects').click(divSubjects);
    $('#settings-hours').click(divHours);
    $('#settings-camera').click(Camera);
    $('#menu-home, .navbar-brand').click(divHome);
    $('#menu-today').click(divToday);
    $('#menu-week').click(divWeek);
    $('#database-empty').click(emptyDB);
    $('#database-export').click(function () { db.transaction(DBJSON, onError); });

}

