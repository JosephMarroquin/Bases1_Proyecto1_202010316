const express = require('express');
const oracledb = require('oracledb');
const cors = require('cors');
const { exec } = require('child_process');



const app = express();
const PORT = 5000;

app.use(express.json());
app.use(cors());

app.get('/', (req, res) => {
    res.send('Hello world!!!')
})

async function crearTemporal() {
    try {
        const connection = await oracledb.getConnection({
            user: 'USUARIO_JOSEPH',
            password: '123',
            connectionString: 'localhost/xe'
        });

        const result = await connection.execute('create table temporal (nombre_victima VARCHAR2(100) , apellido_victima         VARCHAR2(100) ,direccion_victima        VARCHAR2(150) ,fecha_primera_sospecha   VARCHAR2(350) ,fecha_confirmacion       VARCHAR2(350) ,fecha_muerte             VARCHAR2(350),estado_victima           VARCHAR2(100) ,nombre_asociado   VARCHAR2(100) ,apellido_asociado VARCHAR2(100) ,fecha_conocio     VARCHAR2(350) ,contacto_fisico           VARCHAR2(100)  ,fecha_inicio_contacto     VARCHAR2(350)  ,fecha_fin_contacto        VARCHAR2(350)  ,nombre_hospital VARCHAR2(100) ,direccion_hospital VARCHAR2(150) ,ubicacion_victima       VARCHAR2(100) ,fecha_llegada           VARCHAR2(350) ,fecha_retiro            VARCHAR2(350) ,tratamiento              VARCHAR2(100) ,efectividad              VARCHAR2(350) ,fecha_inicio_tratamiento VARCHAR2(350) ,fecha_fin_tratamiento    VARCHAR2(350) ,efectividad_en_victima   VARCHAR2(350) )');
        return result;

    } catch (error) {
        return error;
    }
}

app.get('/consulta1', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select nombre_hospital, direccion_hospital, count(nombre_hospital) as Numero_Muertos
            from victimas
            where (estado_victima='Muerte' or fecha_muerte is not null) and (nombre_hospital is not null and direccion_hospital is not null)
            group by nombre_hospital,direccion_hospital
            order by nombre_hospital
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Direccion: ' + num[1] + ' | Numero de muertos: ' + num[2] + '\n'
                //console.log(index +' | Nombre: '+num[0]+' | Direccion: '+num[1]+' | Numero de muertos: '+num[2]+'\n')
                index++;
            })
            let result2 = await connection.execute(`select nombre_hospital, direccion_hospital from hospital 
            where not exists (select nombre_hospital, direccion_hospital, count(nombre_hospital) as Ningun_Muerto
            from victimas
            where (estado_victima='Muerte' or fecha_muerte is not null) and (nombre_hospital is not null and direccion_hospital is not null) and(hospital.nombre_hospital=victimas.nombre_hospital) and(hospital.direccion_hospital=victimas.direccion_hospital)
            group by nombre_hospital,direccion_hospital)
            order by nombre_hospital
            `)
            result2.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Direccion: ' + num[1] + ' | Numero de muertos: 0' + '\n'
                //console.log(index +' | Nombre: '+num[0]+' | Direccion: '+num[1]+' | Numero de muertos: '+num[2]+'\n')
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta2', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select t.nombre_victima, t.apellido_victima
            from tratamiento t
            join (select nombre_victima, apellido_victima 
            from victimas
            where estado_victima='En cuarentena'
            ) v
            on (t.nombre_victima=v.nombre_victima and t.apellido_victima=v.apellido_victima) and (t.efectividad_en_victima>5) and (t.tratamiento='Transfusiones de sangre')
            order by t.nombre_victima            
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Apellido: ' + num[1] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta3', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select victimas_muertas.nombre_victima, victimas_muertas.apellido_victima, victimas_muertas.direccion
            from(
            select nombre_victima, apellido_victima, max(direccion_victima) as direccion
            from victimas
            where estado_victima='Muerte' or fecha_muerte is not null
            group by nombre_victima,apellido_victima
            ) victimas_muertas
            join (select nombre_victima, apellido_victima, count(nombre_victima) as numero_asociados
            from (select nombre_victima, apellido_victima, nombre_asociado, apellido_asociado
            from contacto
            group by nombre_victima, apellido_victima, nombre_asociado, apellido_asociado
            )
            group by nombre_victima, apellido_victima
            )victimas_numero
            on victimas_muertas.nombre_victima=victimas_numero.nombre_victima  and victimas_muertas.apellido_victima=victimas_numero.apellido_victima and victimas_numero.numero_asociados>3
            order by victimas_muertas.nombre_victima                     
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Apellido: ' + num[1] + ' | Direccion: ' + num[2] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta4', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = 'No existe estado Suspendida'
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta5', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select nombre_victima, apellido_victima
            from(
            select nombre_victima, apellido_victima, max(tratamiento), count(tratamiento) numero_veces
            from tratamiento
            where tratamiento='Oxigeno'
            group by nombre_victima, apellido_victima
            order by nombre_victima
            )
            where rownum<=5                            
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Apellido: ' + num[1] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta6', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select V.nombre_victima, V.apellido_victima, V.fecha_muerte
            from victimas V
            join(
            select ubicacion_victima.nombre_victima, ubicacion_victima.apellido_victima
            from(
            select nombre_victima, apellido_victima
            from tratamiento
            where tratamiento='Manejo de la presion arterial'
            group by nombre_victima, apellido_victima
            order by nombre_victima
            )tratamiento_victima
            join(
            select nombre_victima, apellido_victima
            from ubicaciones
            where ubicacion_victima='1987 Delphine Well'
            group by nombre_victima, apellido_victima
            order by nombre_victima
            )ubicacion_victima
            on tratamiento_victima.nombre_victima=ubicacion_victima.nombre_victima and tratamiento_victima.apellido_victima=ubicacion_victima.apellido_victima
            )todo
            on V.nombre_victima=todo.nombre_victima and V.apellido_victima=todo.apellido_victima
            order by V.nombre_victima                 
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Apellido: ' + num[1] + ' | Fecha Muerte: ' + num[2] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta7', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select resto_consulta.nombre_victima, resto_consulta.apellido_victima, resto_consulta.direccion_victima
from(
select nombre_victima, apellido_victima, count(nombre_victima) as numero_tratamientos
from tratamiento
group by nombre_victima, apellido_victima
order by nombre_victima
) victima_tratamiento
join(
select V.nombre_victima, V.apellido_victima, V.direccion_victima
from victimas V
join(
select conteo_asociados.nombre_victima, conteo_asociados.apellido_victima
from(
select nombre_victima, apellido_victima, count(nombre_victima) as numero_asociados
from (select nombre_victima, apellido_victima, nombre_asociado, apellido_asociado
from contacto
group by nombre_victima, apellido_victima, nombre_asociado, apellido_asociado
)
group by nombre_victima, apellido_victima
order by nombre_victima
) conteo_asociados
where conteo_asociados.numero_asociados<2
) menos2_asociados
on V.nombre_hospital is not null and V.nombre_victima=menos2_asociados.nombre_victima and V.apellido_victima=menos2_asociados.apellido_victima
group by V.nombre_victima, V.apellido_victima, V.direccion_victima
order by V.nombre_victima
) resto_consulta
on victima_tratamiento.numero_tratamientos=2 and resto_consulta.nombre_victima=victima_tratamiento.nombre_victima and resto_consulta.apellido_victima=victima_tratamiento.apellido_victima   
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Apellido: ' + num[1] + ' | Direccion: ' + num[2] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta8', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select V.nombre_victima, V.apellido_victima, extract(month from V.fecha_primera_sospecha) as numero_mes,consulta_sinfehca.numero_tratamientos
            from victimas V
            join(
            select name_tratamiento.nombre_victima, name_tratamiento.apellido_victima,name_tratamiento.numero_tratamientos
            from(
            select nombre_victima, apellido_victima, count(nombre_victima) as numero_tratamientos
            from tratamiento
            group by nombre_victima, apellido_victima
            order by nombre_victima
            ) name_tratamiento
            join(
            select max(numero_tratamientos) as maximo, min(numero_tratamientos) as minimo
            from(
            select nombre_victima, apellido_victima, count(nombre_victima) as numero_tratamientos
            from tratamiento
            group by nombre_victima, apellido_victima
            order by nombre_victima
            )
            )max_min
            on name_tratamiento.numero_tratamientos=max_min.maximo or name_tratamiento.numero_tratamientos=max_min.minimo
            order by name_tratamiento.numero_tratamientos desc
            ) consulta_sinfehca
            on consulta_sinfehca.nombre_victima=V.nombre_victima and consulta_sinfehca.apellido_victima=V.apellido_victima            
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Apellido: ' + num[1] + ' | Numero de mes: ' + num[2] + ' | Cantidad de tratamientos: ' + num[3] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta9', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select H.nombre_hospital, H.direccion_hospital, P.porcentaje_victimas
from hospital H
left join(
select nombre_hospital, direccion_hospital, ((count(nombre_hospital)*100)/341) as porcentaje_victimas
from victimas
where nombre_hospital is not null and direccion_hospital is not null
group by nombre_hospital, direccion_hospital
order by nombre_hospital
) P
on P.nombre_hospital=H.nombre_hospital and P.direccion_hospital=H.direccion_hospital        
            `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Direccion: ' + num[1] + ' | Porcentaje de victimas: ' + num[2]  + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/consulta10', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            let resultado_final = ''

            let result = await connection.execute(`select name_hospital.nombre_hospital, name_hospital.direccion_hospital, name_hospital.contacto_fisico, ((name_hospital.numero_contactos*100)/341) as porcentaje
from(
select C.contacto_fisico, V.nombre_hospital, V.direccion_hospital, count(C.contacto_fisico) as numero_contactos
from contacto C
join(
select nombre_victima, apellido_victima, nombre_hospital, direccion_hospital
from victimas
)V
on C.nombre_victima=V.nombre_victima and C.apellido_victima=V.apellido_victima and V.nombre_hospital is not null and C.contacto_fisico is not null and V.direccion_hospital is not null
group by C.contacto_fisico, V.nombre_hospital, V.direccion_hospital
order by V.nombre_hospital
) name_hospital
join(
select  H.nombre_hospital, H.direccion_hospital,  max(H.numero_contactos) as maximo
from(
select C.contacto_fisico, V.nombre_hospital, V.direccion_hospital, count(C.contacto_fisico) as numero_contactos
from contacto C
join(
select nombre_victima, apellido_victima, nombre_hospital, direccion_hospital
from victimas
)V
on C.nombre_victima=V.nombre_victima and C.apellido_victima=V.apellido_victima and V.nombre_hospital is not null and C.contacto_fisico is not null and V.direccion_hospital is not null
group by C.contacto_fisico, V.nombre_hospital, V.direccion_hospital
order by V.nombre_hospital
)H
group by  H.nombre_hospital, H.direccion_hospital
order by  H.nombre_hospital
) numero_max
on name_hospital.nombre_hospital=numero_max.nombre_hospital and name_hospital.direccion_hospital=numero_max.direccion_hospital and numero_max.maximo=name_hospital.numero_contactos `);
            let index = 1;
            result.rows.forEach(function (num) {
                resultado_final += index + ' | Nombre: ' + num[0] + ' | Direccion: ' + num[1] + ' | Contacto Fisico: ' + num[2] + ' | Porcentaje: ' + num[3] + '\n'
                index++;
            })
            //console.log(result.rows)
            return resultado_final;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/cargarModelo', (req, res) => {
    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            //insertar asociados
            const result_asociado = await connection.execute(`insert into asociados (nombre_asociado,apellido_asociado)
            select  nombre_asociado,apellido_asociado from temporal 
            where nombre_asociado is not null and apellido_asociado is not null
            group by nombre_asociado,apellido_asociado
            `);
            await connection.execute(`Commit`)

            //insertar hospital
            const result_hospital = await connection.execute(`insert into hospital (nombre_hospital,direccion_hospital)
            select  nombre_hospital,direccion_hospital from temporal 
            where nombre_hospital is not null and direccion_hospital is not null
            group by nombre_hospital,direccion_hospital
            `);
            await connection.execute(`Commit`)

            //insertar VICTIMAS
            const result_victima = await connection.execute(`insert into victimas (nombre_victima,apellido_victima,direccion_victima,fecha_primera_sospecha,fecha_confirmacion,fecha_muerte,estado_victima,nombre_hospital,direccion_hospital)
            select  nombre_victima,apellido_victima,max(direccion_victima),max(TO_TIMESTAMP(fecha_primera_sospecha,'DD-MM-YYYY HH24:MI')),max(TO_TIMESTAMP(fecha_confirmacion,'DD-MM-YYYY HH24:MI')),max(TO_TIMESTAMP(fecha_muerte,'DD-MM-YYYY HH24:MI')),max(estado_victima),max(nombre_hospital),max(direccion_hospital) from temporal 
            where nombre_victima is not null and apellido_victima is not null and direccion_victima is not null and fecha_primera_sospecha is not null and fecha_confirmacion is not null and estado_victima is not null
            group by nombre_victima,apellido_victima
            `);
            await connection.execute(`Commit`)

            //insertar historial de ubicaciones de la victima
            const result_ubiaciones = await connection.execute(`insert into ubicaciones (ubicacion_victima,fecha_llegada,fecha_retiro,nombre_victima,apellido_victima)
            select  ubicacion_victima,TO_TIMESTAMP(fecha_llegada,'MM-DD-YYYY HH24:MI'),TO_TIMESTAMP(fecha_retiro,'MM-DD-YYYY HH24:MI'),nombre_victima,apellido_victima from temporal 
            where ubicacion_victima is not null and fecha_llegada is not null and fecha_retiro is not null and nombre_victima is not null and apellido_victima is not null
            group by ubicacion_victima,fecha_llegada,fecha_retiro,nombre_victima,apellido_victima
            `);
            await connection.execute(`Commit`)

            //insertar tratamiento que se le aplico a la victima
            const result_tratamiento = await connection.execute(`insert into tratamiento (tratamiento,efectividad,fecha_inicio_tratamiento,fecha_fin_tratamiento,efectividad_en_victima,hospital_nombre_hospital,direccion_hospital,nombre_victima,apellido_victima)
            select  tratamiento,efectividad,TO_TIMESTAMP(fecha_inicio_tratamiento,'MM-DD-YYYY HH24:MI'),TO_TIMESTAMP(fecha_fin_tratamiento,'MM-DD-YYYY HH24:MI'),efectividad_en_victima,nombre_hospital,direccion_hospital,nombre_victima,apellido_victima from temporal 
            where tratamiento is not null and efectividad is not null and fecha_inicio_tratamiento is not null and fecha_fin_tratamiento is not null and efectividad_en_victima is not null and nombre_hospital is not null and direccion_hospital is not null and nombre_victima is not null and apellido_victima is not null
            group by tratamiento,efectividad,fecha_inicio_tratamiento,fecha_fin_tratamiento,efectividad_en_victima,nombre_hospital,direccion_hospital,nombre_victima,apellido_victima`);
            await connection.execute(`Commit`)

            //insertar el tipo de contacto con los asociados
            const result_contacto = await connection.execute(`insert into contacto (contacto_fisico,fecha_inicio_contacto,fecha_fin_contacto,nombre_asociado,apellido_asociado,nombre_victima,apellido_victima)
            select  contacto_fisico,TO_TIMESTAMP(fecha_inicio_contacto,'MM-DD-YYYY HH24:MI'),TO_TIMESTAMP(fecha_fin_contacto,'MM-DD-YYYY HH24:MI'),nombre_asociado,apellido_asociado,nombre_victima,apellido_victima from temporal 
            where nombre_asociado is not null and apellido_asociado is not null and nombre_victima is not null and apellido_victima is not null
            group by contacto_fisico,fecha_inicio_contacto,fecha_fin_contacto,nombre_asociado,apellido_asociado,nombre_victima,apellido_victima            
            `);
            await connection.execute(`Commit`)


            let result = 'Modelo Cargado Correctamente'
            console.log(result)
            return result;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })
});

app.get('/eliminarModelo', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            await connection.execute('delete from asociados');
            await connection.execute(`Commit`)
            await connection.execute('delete from contacto');
            await connection.execute(`Commit`)
            await connection.execute('delete from hospital');
            await connection.execute(`Commit`)
            await connection.execute('delete from tratamiento');
            await connection.execute(`Commit`)
            await connection.execute('delete from ubicaciones');
            await connection.execute(`Commit`)
            await connection.execute('delete from victimas');
            await connection.execute(`Commit`)

            let result = 'Modelo Eliminado Correctamente'
            console.log(result)
            return result;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/cargarTemporal', (req, res) => {

    crearTemporal()
        .then(dbRes => {
            console.log(dbRes)
        })
        .catch(err => {
            console.log(err)
            res.send(err)
        })
    exec("sqlldr userid=USUARIO_JOSEPH/123 control=cargarTemporal.ctl", (error, stdout, stderr) => {
        if (error) {
            console.log(`error: ${error.message}`);
            return;
        }
        if (stderr) {
            console.log(`stderr: ${stderr}`);
            return;
        }
        console.log(`stdout: ${stdout}`);
        res.status(200).send(`stdout: ${stdout}`)
    });

});

app.get('/eliminarTemporal', (req, res) => {

    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'USUARIO_JOSEPH',
                password: '123',
                connectionString: 'localhost/xe'
            });

            const result = await connection.execute('DROP TABLE TEMPORAL');
            console.log(result)
            return result;

        } catch (error) {
            console.log(error)
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.get('/customers', (req, res) => {
    async function fetchDataCustomers() {
        try {
            const connection = await oracledb.getConnection({
                user: 'HR',
                password: '123',
                connectionString: 'localhost/xe'
            });

            const result = await connection.execute('SELECT * FROM hr.customers');
            return result;

        } catch (error) {
            return error;
        }
    }

    fetchDataCustomers()
        .then(dbRes => {
            res.send(dbRes);
        })
        .catch(err => {
            res.send(err)
        })

});

app.listen(5000, () => { console.log(`listen to port ${PORT} `); })