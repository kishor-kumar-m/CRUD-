import express from 'express'
import { signup } from '../controllers/users';
import { login } from '../controllers/users';
import { update } from '../controllers/users';
import { delete_user } from '../controllers/users';
import { users } from '../controllers/users';
import { user } from '../controllers/users';


const router = express.Router();


router.post('/signup',signup);
router.post('/login',login);
router.patch('/update/:userId',update);
router.delete('/delete/:userId',delete_user);
router.get('/',users);
router.get('/:userId',user);


module.exports = router;