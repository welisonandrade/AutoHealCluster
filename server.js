const express = require('express');
const redis = require('redis');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));

// conexao com redis
const redisClient = redis.createClient({
    host: process.env.REDIS_HOST || 'redis-service',
    port: process.env.REDIS_PORT || 6379
});

redisClient.on('error', (err) => {
    console.log('erro no redis:', err);
});

redisClient.on('connect', () => {
    console.log('conectado ao redis!');
});

// funcao para simular carga de cpu quando necessario
function simulateCpuLoad() {
    const start = Date.now();
    while (Date.now() - start < 100) {
        // loop simples para consumir cpu
        Math.random() * Math.random();
    }
}

// rotas da api
app.get('/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// listar todas as tarefas
app.get('/api/tasks', async (req, res) => {
    try {
        const tasks = await redisClient.lRange('tasks', 0, -1);
        const parsedTasks = tasks.map(task => JSON.parse(task));
        res.json(parsedTasks);
    } catch (error) {
        console.error('erro ao buscar tarefas:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
});

// criar nova tarefa
app.post('/api/tasks', async (req, res) => {
    try {
        const { title, description } = req.body;
        
        if (!title) {
            return res.status(400).json({ error: 'titulo é obrigatorio' });
        }

        const task = {
            id: Date.now().toString(),
            title,
            description: description || '',
            completed: false,
            createdAt: new Date().toISOString()
        };

        await redisClient.lPush('tasks', JSON.stringify(task));
        res.status(201).json(task);
    } catch (error) {
        console.error('erro ao criar tarefa:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
});

// marcar tarefa como concluida
app.put('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const { completed } = req.body;

        const tasks = await redisClient.lRange('tasks', 0, -1);
        let taskFound = false;

        for (let i = 0; i < tasks.length; i++) {
            const task = JSON.parse(tasks[i]);
            if (task.id === taskId) {
                task.completed = completed;
                await redisClient.lSet('tasks', i, JSON.stringify(task));
                taskFound = true;
                res.json(task);
                break;
            }
        }

        if (!taskFound) {
            res.status(404).json({ error: 'tarefa nao encontrada' });
        }
    } catch (error) {
        console.error('erro ao atualizar tarefa:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
});

// deletar tarefa
app.delete('/api/tasks/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const tasks = await redisClient.lRange('tasks', 0, -1);
        let taskFound = false;

        for (let i = 0; i < tasks.length; i++) {
            const task = JSON.parse(tasks[i]);
            if (task.id === taskId) {
                await redisClient.lRem('tasks', 1, tasks[i]);
                taskFound = true;
                res.json({ message: 'tarefa deletada com sucesso' });
                break;
            }
        }

        if (!taskFound) {
            res.status(404).json({ error: 'tarefa nao encontrada' });
        }
    } catch (error) {
        console.error('erro ao deletar tarefa:', error);
        res.status(500).json({ error: 'erro interno do servidor' });
    }
});

// rota para gerar carga de cpu (para testar o hpa)
app.get('/api/load', (req, res) => {
    console.log('gerando carga de cpu...');
    simulateCpuLoad();
    res.json({ message: 'carga de cpu gerada' });
});

// iniciar servidor
app.listen(PORT, () => {
    console.log(`servidor rodando na porta ${PORT}`);
});
