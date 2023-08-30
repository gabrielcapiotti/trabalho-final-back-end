 = [];
const notes = [];

app.use(express.json());

app.post('/user', async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Digite todos os campos',
        });
    }

    const userExists = users.some((user) => user.email === email);

    if (userExists) {
        return res.status(400).json({
            success: false,
            message: 'Usuário já cadastrado!',
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = {
        name,
        email,
        password: hashedPassword,
        id: uuidv4(),
        notes: [],
    };

    users.push(newUser);

    return res.status(201).json({
        success: true,
        message: 'Usuário cadastrado com sucesso',
        data: newUser,
    });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    const user = users.find((user) => user.email === email);

    if (!user) {
        return res.status(404).json({
            message: 'Usuário não encontrado.',
        });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
        return res.status(400).json({
            message: 'Credenciais inválidas.',
        });
    }

    return res.status(200).json({
        message: 'Login bem-sucedido!',
        userId: user.id,
    });
});

app.post("/notes", (req, res) => {
    const { title, description, userId } = req.body;

    const user = users.find(user => user.id === userId);
    if (!user) {
        return res.status(404).json({
            message: "Usuário não foi encontrado."
        });
    }

    const newNote = {
        id: uuidv4(),
        title,
        description,
        userId
    };

    notes.push(newNote);
    res.status(201).json({
        message: "Anotação criada com sucesso.",
        note: newNote
    });
});

app.get("/notes/:userId", (req, res) => {
    const { userId } = req.params;
    const user = users.find(user => user.id === userId);

    if (!user) {
        return res.status(404).json({
            message: "Usuário não encontrado."
        });
    }

    const userNotes = notes.filter(note => note.userId === userId);
    res.status(200).json(userNotes);
});

app.put("/notes/:noteId", (req, res) => {
    const { noteId } = req.params;
    const { title, description } = req.body;

    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
        return res.status(404).json({
            message: "Nota não encontrada."
        });
    }
    
    notes[noteIndex].title = title;
    notes[noteIndex].description = description;

    res.status(200).json({
        message: "Atualização das notas completa."
    });
});

app.delete("/notes/:noteId", (req, res) => {
    const { noteId } = req.params;

    const noteIndex = notes.findIndex(note => note.id === noteId);
    if (noteIndex === -1) {
        return res.status(404).json({
            message: "Nota não encontrada."
        });
    }

    const deletedNote = notes.splice(noteIndex, 1);

    res.status(200).json({
        message: "Nota deletada com sucesso.",
        note: deletedNote
    });
});

app.listen(3333, () => console.log("Servidor rodando na porta 3333"));

