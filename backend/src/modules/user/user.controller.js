const { z } = require('zod');
const pool = require('../../config/db');

const OnboardSchema = z.object({
    name: z.string().min(2).optional(),
    height_cm: z.number().min(100).max(250).optional(),
    weight_kg: z.number().min(30).max(300).optional(),
    age: z.number().int().min(10).max(100).optional(),
    gender: z.enum(['male', 'female']).optional(),
    fitness_goal: z.enum(['strength', 'aesthetic', 'fat_loss']).optional(),
});

const getMe = async (req, res, next) => {
    try {
        const result = await pool.query(
            `SELECT id, name, email, has_completed_intro, created_at
       FROM users WHERE id = ?`,
            [req.user.userId]
        );
        if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
        res.json(result.rows[0]);
    } catch (err) {
        next(err);
    }
};

const onboard = async (req, res, next) => {
    try {
        const data = OnboardSchema.parse(req.body);
        // Safe shim: do not write to users table.
        // Onboarding has moved to PUT /profiles/:id
        res.status(200).json({ 
            message: 'Deprecated: Onboarding moved to profile level. Please use /api/profiles/:id instead.',
            deprecated: true 
        });
    } catch (err) {
        next(err);
    }
};

const markIntroComplete = async (req, res, next) => {
    try {
        await pool.query('UPDATE users SET has_completed_intro = 1 WHERE id = ?', [req.user.userId]);
        res.json({ message: 'Onboarding video marked as watched' });
    } catch (err) {
        next(err);
    }
};

module.exports = { getMe, onboard, markIntroComplete };
