import faker from 'faker';

export const newUser = {
  firstName: 'King',
  lastName: 'David',
  email: 'jubilee.barefootnomad@gmail.com',
  country: 'Nigeria',
  companyName: 'Andela',
  password: 'Elijahayodele12',
  gender: 'male',
  street: '20, Board Street',
  city: 'ikeja',
  state: 'Lagos',
  birthdate: faker.date.past(),
  phoneNumber: '08063345598'
};

export const newCompany = {
  firstName: 'Ago',
  lastName: 'Akin',
  email: 'daylay6@gmail.com',
  password: faker.internet.password(15, false),
  companyName: faker.company.companyName(),
  companyAddress: '20, Ania street, Ojomo',
  companySizeId: 2,
  companyPlanId: 3
};

export const obj = {};
