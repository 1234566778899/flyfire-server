const { OpenAI } = require('openai');
require('dotenv').config();
const Challenge = require('../db/Schemas/Challenge');
const Task = require('../db/Schemas/Task');
const User = require('../db/Schemas/User');
const Result = require('../db/Schemas/Result');
const openai = new OpenAI({
    apiKey: process.env.API_KEY
});

const generate = async (req, res) => {
    try {
        const { lenguaje, level, topics, count, users } = req.body;
        const chls = await Challenge.find({ "users.id": { $in: users.map(x => x.id) } })
        const tks = await Task.find({ challenge: chls._id });
        const allTitles = tks.map(task => task.title);
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente IA que genera ${count} desafíos de programación con temas sobre ${topics.join(',')} en formato JSON con la siguiente estructura: {challenges:[{title:String, description:String, format_input:String, format_output:String, restriction:String,example_input:String,example_output:String,explanation:String}]}. El desafío debe tener un nivel de dificultad de ${level}, y el lenguaje de programación debe ser ${lenguaje}. Asegúrate de que la descripción del problema sea clara y que los ejemplos de entrada y salida estén bien definidos. Solo da como respuesta el formato JSON. El rango de nivel de dificultad es de 1 al 10. Guiate de los ejercicios de Hackerrank. Evitar repetir las siguientes preguntas: ${allTitles.join(',')}`
                },
                {
                    role: "user",
                    content: "Genera un desafío de programación"
                }
            ],
            temperature: 0.8
        });
        const text = completion.choices[0].message.content;
        const jsonResponse = text.match(/\{.*\}/s);
        const tasks = JSON.parse(jsonResponse).challenges;
        const challenge = new Challenge(req.body);
        await Task.insertMany(tasks.map(x => ({ ...x, challenge: challenge._id })));
        await challenge.save();
        return res.status(200).send(challenge);
    } catch (error) {
        console.log(error);
        return res.status(500).send({ error: 'Error en el servidor' });
    }
}

const generateIndividualChallenges = async (req, res) => {
    try {
        const { user } = req.params;
        const userFound = await User.find({ _id: user });
        const avr = 3;
        const result = await Result.aggregate([
            {
                $match: { user }
            },
            {
                $group: {
                    _id: null,
                    averageScore: { $avg: '$score' }
                }
            }
        ]);

        if (result.length > 0) {
            avr = parseInt(result[0].averageScore / 2);

        }
        const tks = await Task.find({ user });
        if (tks.length >= 10) {
            return res.status(200).send(tks);
        }
        const count = 10 - tks.length;
        const allTitles = tks.map(task => task.title);
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: "system",
                    content: `Eres un asistente IA que genera ${count} desafíos de programación con temas sobre ${['Condicionales', 'Bucles', 'Arreglos']} en formato JSON con la siguiente estructura: {challenges:[{title:String, description:String, format_input:String, format_output:String, restriction:String,example_input:String,example_output:String,explanation:String}]}. El desafío debe tener un nivel de dificultad de ${avr}, y el lenguaje de programación debe ser ${userFound.favoriteLenguaje}. Asegúrate de que la descripción del problema sea clara y que los ejemplos de entrada y salida estén bien definidos. Solo da como respuesta el formato JSON. El rango de nivel de dificultad es de 1 al 10. Guiate de los ejercicios de Hackerrank. Evitar repetir las siguientes preguntas: ${allTitles.join(',')}`
                },
                {
                    role: "user",
                    content: "Genera un desafío de programación"
                }
            ],
            temperature: 0.8
        });
        const text = completion.choices[0].message.content;
        const jsonResponse = text.match(/\{.*\}/s);
        const tasks = JSON.parse(jsonResponse).challenges;
        await Task.insertMany(tasks.map(x => ({ ...x, user })));
        return res.status(200).send([...tks, ...tasks]);
    } catch (error) {
        console.log(error.response);
        return res.status(500).send({ error: 'Error en el servidor' });
    }
}

const getChallenge = async (req, res) => {
    try {
        const { id } = req.params;
        const challengeFound = await Challenge.findOne({ _id: id }).lean();
        const tasks = await Task.find({ challenge: challengeFound._id }).lean();
        if (!challengeFound) return res.status(400).send({ error: 'Desafio no encontrado' });
        res.status(200).send({ ...challengeFound, tasks });
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
}

const createInitialTest = async (req, res) => {
    try {
        const { user, lenguaje } = req.body;
        const tasks = [
            {
                "title": "Sumando Enteros",
                "description": "Escribe un programa que calcule la suma de una lista de números enteros.",
                "format_input": "La primera línea contiene un número entero N que indica la cantidad de números. La segunda línea contiene N números enteros separados por espacios.",
                "format_output": "Un número entero que representa la suma de los **N** números.",
                "restriction": "No hay restricciones especiales.",
                "example_input": "5\n1 2 3 4 5",
                "example_output": "15",
                "explanation": "La suma de 1 + 2 + 3 + 4 + 5 es 15."
            },
            {
                "title": "Clasificación de Triángulos",
                "description": "Determina el tipo de triángulo (Equilátero, Isósceles, Escaleno) dado el tamaño de sus tres lados.",
                "format_input": "Tres números enteros positivos separados por espacios que representan los lados del triángulo.",
                "format_output": "Una cadena que indica el tipo de triángulo: \"Equilátero\", \"Isósceles\" o \"Escaleno\".",
                "restriction": "Los tres lados siempre formarán un triángulo válido.",
                "example_input": "3 3 3",
                "example_output": "Equilátero",
                "explanation": "Todos los lados son iguales, por lo tanto, es un triángulo equilátero."
            },
            {
                "title": "Sumatoria de Números Pares",
                "description": "Calcula la suma de todos los números pares en una lista de números enteros.",
                "format_input": "La primera línea contiene un número entero N. La segunda línea contiene N números enteros separados por espacios.",
                "format_output": "Un número entero que representa la suma de todos los números pares.",
                "restriction": "Debes utilizar bucles para iterar sobre la lista.",
                "example_input": "6\n1 2 3 4 5 6",
                "example_output": "12",
                "explanation": "Los números pares son 2, 4 y 6; su suma es 12."
            },
            {
                "title": "Rotación de Matriz",
                "description": "Dada una matriz cuadrada de tamaño N x N, rota la matriz 90 grados en el sentido de las agujas del reloj.",
                "format_input": "La primera línea contiene un número entero **N**. Las siguientes N líneas contienen **N** números enteros cada una, separados por espacios.",
                "format_output": "La matriz rotada, con cada fila en una nueva línea y los números separados por espacios.",
                "restriction": "Debes manipular la matriz original sin utilizar matrices auxiliares grandes.",
                "example_input": "3\n1 2 3\n4 5 6\n7 8 9",
                "example_output": "7 4 1\n8 5 2\n9 6 3",
                "explanation": "La matriz rotada 90 grados en el sentido de las agujas del reloj."
            },
            {
                "title": "Verificación de Anagramas",
                "description": "Determina si dos cadenas de texto son anagramas (contienen las mismas letras en diferente orden).",
                "format_input": "Dos cadenas de texto en minúsculas, una en cada línea.",
                "format_output": "La palabra \"Anagramas\" si las cadenas son anagramas, o \"No son anagramas\" si no lo son.",
                "restriction": "Ignora los espacios en blanco al verificar si son anagramas.",
                "example_input": "listen\nsilent",
                "example_output": "Anagramas",
                "explanation": "Las dos palabras contienen las mismas letras."
            }
        ]
        const data = { code: '000000', count: 5, lenguaje, users: [user], time: 60, tasks };
        const challenge = new Challenge(data);
        await challenge.save();
        await Task.insertMany(tasks.map(x => ({ ...x, challenge: challenge._id })));
        return res.status(200).send(challenge._id);
    } catch (error) {
        console.log(error);
        res.status(500).send({ error: 'Error en el servidor' });
    }
}
module.exports = {
    generate,
    getChallenge,
    createInitialTest,
    generateIndividualChallenges
}
