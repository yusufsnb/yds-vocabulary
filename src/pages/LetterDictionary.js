import React, { Component, createRef } from 'react'
import { ActivityIndicator, TextInput } from 'react-native'
import { StyleSheet } from 'react-native'
import { TouchableHighlight } from 'react-native'
import { Text, View, ScrollView } from 'react-native'
import { Icon, Input } from 'react-native-elements'
import { Swipeable } from 'react-native-gesture-handler'
import LinearGradient from 'react-native-linear-gradient'
import Animated from 'react-native-reanimated'
import { openDatabase } from 'react-native-sqlite-storage'

export default class LetterDictionary extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dictionary: [],
            countOfVocabulary: 15,
            scrollY: new Animated.Value(0),
            loadMoreData: false,
            filteredDictionary: [],
            filterText: ''
        }
        this.scrollRef = createRef()
    }
    componentDidMount() {
        this.setState({
            dictionary: this.props.route.params.dictionary
        })
    }
    isCloseToBottom = ({ layoutMeasurement, contentOffset, contentSize }) => {
        const paddingToBottom = 20
        return layoutMeasurement.height + contentOffset.y >=
            contentSize.height - paddingToBottom
    }
    loadMoreData = () => {
        if (this.state.countOfVocabulary <= this.state.dictionary.length)
            this.setState({
                countOfVocabulary: this.state.countOfVocabulary + 15,
                loadMoreData: false
            })
    }
    scrollUpToTop = () => {
        this.scrollRef.current.scrollTo({
            y: 0,
            animated: true
        })
    }
    filterDictionary = (filter) => {
        this.setState({
            filteredDictionary: this.state.dictionary.filter(i => i.vocabulary.toLowerCase().
                includes(filter.toLowerCase())), filterText: filter
        })
    }
    addToFavorite = (id, index, isFavorite) => {
        const db = openDatabase({
            name: 'yds',
            createFromLocation: '~www/sqlite_yds.db'
        })
        db.transaction(tx => {
            tx.executeSql('UPDATE dictionary SET favorite=? WHERE id=?', [!isFavorite, id], (tx, results) => {
                if (results.rowsAffected > 0) {
                }
            }, (err) => console.log(err))
        })
    }
    render() {
        const dictionary = this.state.filterText == '' ? this.state.dictionary :
            this.state.filteredDictionary
        if (this.state.dictionary.length === 0)
            return (
                <View style={{ flex: 1 }}>
                    <ActivityIndicator color={'wheat'} size={50} />
                </View>)
        return (
            <LinearGradient colors={['#25283D', '#2C5364']} style={styles.container}>
                <Input
                    placeholder='Kelime arayın...'
                    leftIcon={
                        <Icon
                            name='search'
                            size={18}
                            color='wheat'
                        />
                    }
                    inputStyle={{ color: 'white', fontSize: 15 }}
                    onChangeText={(filter) => this.filterDictionary(filter)}
                />
                <Animated.ScrollView
                    scrollEventThrottle={16}
                    onScroll={Animated.event(
                        [{ nativeEvent: { contentOffset: { y: this.state.scrollY } } }],
                        {
                            listener: event => {
                                if (this.isCloseToBottom(event.nativeEvent)) {
                                    this.setState({ loadMoreData: true })
                                    this.loadMoreData()
                                }
                            }
                        }
                    )}
                    onMomentumScrollEnd={({ nativeEvent }) => {
                        if (this.isCloseToBottom(nativeEvent)) {
                            this.setState({ loadMoreData: true })
                            this.loadMoreData()
                        }
                    }}
                    ref={this.scrollRef}
                >
                    {dictionary.slice(0, this.state.countOfVocabulary).map((l, i) => (
                        <View key={i} style={styles.listItem}>
                            <Text style={styles.listItemText}>
                                {l.vocabulary.charAt(0).toUpperCase() + l.vocabulary.slice(1)}
                            </Text>
                            <Text style={{ color: 'white' }}>{l.translate}</Text>
                            <Icon name={l.favorite === 0 ? 'star-outline' : 'star'}
                                containerStyle={styles.favIcon} color='white'
                                onPress={() => this.addToFavorite(l.id, i, l.favorite)} />
                        </View>
                    ))}
                    {this.state.loadMoreData === true ?
                        (<ActivityIndicator color={'wheat'} size={15} />) : <></>}
                </Animated.ScrollView>
                <TouchableHighlight style={styles.btnArrowUp}
                    onPress={this.scrollUpToTop} underlayColor={'darkslategray'}>
                    <Icon name='arrow-up' type='font-awesome' color='white'
                        size={20} />
                </TouchableHighlight>
            </LinearGradient>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 15,
    },
    listItem: {
        borderBottomWidth: 0.25,
        borderColor: 'white',
        marginBottom: 5,
        paddingLeft: 10,
        paddingVertical: 5,
    },
    listItemText: {
        color: 'wheat',
        fontWeight: 'bold'
    },
    btnArrowUp: {
        position: 'absolute',
        right: 10,
        bottom: 10,
        backgroundColor: 'darkcyan',
        padding: 10,
        borderRadius: 50
    },
    favIcon: {
        position: 'absolute',
        right: 15,
        top: 15
    }
})