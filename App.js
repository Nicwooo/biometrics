import React from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  AsyncStorage,
  Alert,
} from 'react-native';

import ReactNativeBiometrics from 'react-native-biometrics';

const App = () => {
  const [firstName, onFirstNameChange] = React.useState('');
  const [lastName, onLastNameChange] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [data, setData] = React.useState({});
  const [showLoginButton, setShowLoginButton] = React.useState(false);

  const isObjectEmpty = (objectToCheck) => {
    return Object.keys(objectToCheck).length !== 0;
  }

  const displayFingerPrint = (callbackMethod) => {
    ReactNativeBiometrics.simplePrompt({promptMessage: 'Utiliser mon empreinte', cancelButtonText: 'Annuler'})
      .then((resultObject) => {
        const { success } = resultObject

        if (success) {
            callbackMethod();
        } else {
          Alert.alert('Utilisation biométrique annulée');
        }
      })
      .catch(() => {
        Alert.alert('L\'utilisation biométrique a échouée');
      })
  }

  const checkInputs = () => {
    const inputErrors = {};

    if (firstName === '') {
      inputErrors.firstName = 'Champs requis';
    }

    if (lastName === '') {
      inputErrors.lastName = 'Champs requis';
    }

    setErrors(inputErrors);

    return !isObjectEmpty(inputErrors);
  }

  const signIn = async () => {
    try {
      let returnedData = await AsyncStorage.getItem('credentials');
      returnedData = JSON.parse(returnedData);

      if (returnedData.firstName && returnedData.lastName) {
        setData(returnedData);
      }
    } catch (error) {
      console.log(error)
      Alert.alert('Echec de la connexion');
    }
  }

  const signUp = async () => {
    const areInputsValid = checkInputs();

    if (areInputsValid) {
      try {
        await AsyncStorage.setItem('credentials', JSON.stringify({
          firstName, lastName
        }));

        onFirstNameChange('');
        onLastNameChange('');
        setShowLoginButton(true);
        Alert.alert('Inscription réussie');
      } catch (error) {
        Alert.alert('Echec de l\'inscription, veuillez réessayer');
      }
    }
  }

  const showClearAppAlert = () => {
    Alert.alert(
      'Suppression des données',
      'Cette action supprimera la totalité des données de l\'application, souhaitez vous continuer ?',
      [
        { text: "Annuler", onPress: () => null },
        { text: "Confirmer", onPress: () => executeClear() },
      ]
    );
  }

  const executeClear = async () => {
    await AsyncStorage.clear();
    onFirstNameChange('');
    onLastNameChange('');
    setData({});
    setErrors({});
    setShowLoginButton(false);

    Alert.alert('Toutes les données ont été supprimées');
  };
 
  return (
      <ScrollView>
        <View>
          {isObjectEmpty(data) && 
            <View style={styles.credentialsContainer}>
              <View style={styles.credentials}>
                <Text>
                  Votre prénom : {data?.firstName ?? ''}
                </Text>
              </View>
              <View style={styles.credentials}>
                <Text>
                  Votre nom : {data?.lastName ?? ''}
                </Text>
              </View>
            </View>
          }
          {showLoginButton &&
            <View>
              <View style={styles.button}>
                <Button
                    onPress={() => displayFingerPrint(signIn)}
                    title="Se connecter"
                    color="#03ac13"
                  />
              </View>
              <View style={styles.separator} />
            </View>
          }
          <View>
            <TextInput
              style={styles.input} 
              onChangeText={onFirstNameChange}
              value={firstName}
              placeholder="Prénom"
            />
            <Text style={styles.errorMessage}>{errors.firstName ?? ''}</Text>
            <TextInput
              style={styles.input}
              onChangeText={onLastNameChange}
              value={lastName}
              placeholder="Nom"
            />
            <Text style={styles.errorMessage}>{errors.lastName ?? ''}</Text>
            <View style={styles.button}>
              <Button
                onPress={() => signUp()}
                title="S'inscrire"
                color="#03ac13"
              />
            </View>
            <View style={styles.separator} />
            <View style={styles.button}>
              <Button
                onPress={() => showClearAppAlert()}
                title="Nettoyer l'application"
                color="#990f02"
                />
            </View>
          </View>
        </View>
      </ScrollView>
  );
};

const styles = StyleSheet.create({
  input: {
    borderColor: 'grey',
    borderWidth: 1,
    marginTop: 15,
    marginHorizontal: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  button: {
    marginVertical: 10,
    marginHorizontal: 50,
  },
  credentialsContainer: {
    borderColor: 'grey',
    borderWidth: 1,
    marginHorizontal: 25,
    marginVertical: 25,
    padding: 10,
  },
  credentials: {
    marginVertical: 2,
  },
  separator: {
    borderBottomColor: 'grey',
    borderBottomWidth: 1,
    marginHorizontal: 15,
    marginVertical: 20,
  },
  errorMessage: {
    marginHorizontal: 20,
    marginTop: 2,
    color: '#990f02',
  }
});

export default App;
